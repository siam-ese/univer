/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Disposable, toDisposable, Tools } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject } from 'rxjs';
import { chartDataPipeline } from './chart-data-pipeline';
import type { ChartModelManager } from './chart-model-manager';
import type { ChartDataSource, ChartStyle, ChartType, IChartConfig, IChartDataConfig } from './types';
import { DataDirection } from './types';

export interface IChartModelOption {
    id?: string;
    dataSource: Observable<ChartDataSource>;
    dataConfig?: Partial<IChartDataConfig>;
    style?: ChartStyle;
}

export class ChartModel extends Disposable {
    private _dataSource$: Observable<ChartDataSource>;
    public readonly id: string;
    private _chartTypeSubject = new BehaviorSubject<ChartType | null>(null);
    private _chartType$ = this._chartTypeSubject.asObservable();

    private _dataConfig$ = new BehaviorSubject<IChartDataConfig>({
        aggregate: false,
        direction: DataDirection.Row,
    });

    dataConfig$ = this._dataConfig$.asObservable();

    private _config$ = new Subject<IChartConfig>();
    config$ = this._config$.asObservable();

    private _style$ = new Subject<ChartStyle>();
    style$ = this._style$.asObservable();
    public style: ChartStyle = {};

    constructor(option: IChartModelOption, private _manager: ChartModelManager) {
        super();

        const { id, dataSource, dataConfig, style } = option;
        this.id = id || Tools.generateRandomId();

        this._dataSource$ = dataSource;
        if (dataConfig) {
            this.setChartDataConfig(dataConfig);
        }
        if (style) {
            this.setStyle(style);
        }
        this._init();
    }

    private _init() {
        const { _manager } = this;
        this.disposeWithMe(
            toDisposable(
                combineLatest([
                    this._chartType$.pipe(distinctUntilChanged()),
                    this._dataSource$,
                    this._dataConfig$,
                ]).pipe(filter(([chartType]) => Boolean(chartType)))
                    .subscribe(([chartType, dataSource, dataConfig]) => {
                        const generator = _manager.generatorProvider.getGenerator(chartType!);
                        if (generator) {
                            const chartData = chartDataPipeline.getOutput(dataSource, dataConfig);
                            const config = generator(chartType!, chartData);
                            this._config$.next(config);
                        }
                    })
            )
        );
    }

    setStyle(newStyle: ChartStyle) {
        this.style = Object.assign({}, this.style, newStyle);

        this._style$.next(this.style);
    }

    setChartDataConfig(config: Partial<IChartDataConfig>) {
        const { _dataConfig$ } = this;
        const dataConfig = Object.assign({}, _dataConfig$.getValue(), config);
        _dataConfig$.next(dataConfig);
    }

    setChart(chartItem: ChartType) {
        this._chartTypeSubject.next(chartItem);
    }

    override dispose(): void {
        super.dispose();

        this._chartTypeSubject.complete();
        this._config$.complete();
    }
}
