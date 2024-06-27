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

import { Disposable, Tools } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject } from 'rxjs';
import { chartDataPipeline } from './chart-data-pipeline';
import type { ChartModelManager } from './chart-model-manager';
import type { ChartDataSource, IChartConfig, IChartDataContext } from './types';
import type { ChartStyle } from './style.types';
import { ChartType, DataDirection } from './constants';

export interface IChartModelOption {
    id?: string;
    dataSource: Observable<ChartDataSource>;
    dataConfig?: Partial<IChartDataContext>;
    style?: ChartStyle;
}

export class ChartModel extends Disposable {
    private _disposeEffects = new Set<() => void>();
    private _dataSource$: Observable<ChartDataSource>;
    public readonly id: string;

    /** chart type */
    private _chartTypeSubject = new BehaviorSubject<ChartType>(ChartType.Line);
    chartType$ = this._chartTypeSubject.asObservable();
    get chartType() {
        return this._chartTypeSubject.getValue();
    }

    /** chart data config */
    private _dataConfig$ = new BehaviorSubject<IChartDataContext>({
        aggregate: false,
        direction: DataDirection.Row,
    });

    dataConfig$ = this._dataConfig$.asObservable();

    /** chart  config */
    private _config$ = new BehaviorSubject<IChartConfig | null>(null);
    config$ = this._config$.asObservable();

    /** chart style config */
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
            combineLatest([
                this.chartType$.pipe(distinctUntilChanged()),
                this._dataSource$,
                this._dataConfig$,
            ]).pipe(
                filter(([chartType]) => Boolean(chartType))
            )
                .subscribe(([_chartType, dataSource, dataConfig]) => {
                    const chartType = _chartType!;
                    // console.log(dataConfig, 'dataConfig');
                    // console.log(dataSource, 'dataSource');
                    const chartData = chartDataPipeline.getOutput(dataSource, dataConfig);
                    const chartConfig = _manager.convertChartConfig(chartType, chartData);
                    // console.log(chartConfig, 'chartConfig');
                    if (!chartConfig) {
                        return;
                    }

                    this._config$.next(chartConfig);
                })
        );
    }

    setStyle(newStyle: ChartStyle) {
        this.style = Object.assign({}, this.style, newStyle);

        this._style$.next(this.style);
    }

    setChartDataConfig(config: Partial<IChartDataContext>) {
        const { _dataConfig$ } = this;
        const dataConfig = Object.assign({}, _dataConfig$.getValue(), config);
        _dataConfig$.next(dataConfig);
    }

    setChart(type: ChartType) {
        this._chartTypeSubject.next(type);
    }

    onDispose(effect: () => void) {
        this._disposeEffects.add(effect);
    }

    override dispose(): void {
        super.dispose();

        this._disposeEffects.forEach((effect) => effect());
        this._disposeEffects.clear();
        this._chartTypeSubject.complete();
        this._config$.complete();
    }
}
