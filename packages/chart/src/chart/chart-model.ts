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

import type { Nullable } from '@univerjs/core';
import { Disposable, Tools } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';
import type { IChartDataPipelineContext, IChartDataPipelineOperator } from './chart-data-pipeline/chart-data-pipeline';
import { ChartDataPipeline, dataSourcePipeline, outputPipeline } from './chart-data-pipeline/chart-data-pipeline';
import type { ChartDataSource, IChartConfig, IChartData, IChartDataConfig } from './types';
import type { ChartStyle } from './style.types';
import { ChartType } from './constants';

export interface IChartModelOption {
    id?: string;
    chartType?: ChartType;
    dataSource$: Observable<ChartDataSource>;
    dataConfig?: Partial<IChartDataConfig>;
    style?: ChartStyle;
    convertConfig: (chartType: ChartType, chartData: IChartData) => Nullable<IChartConfig>;
}

export class ChartModel extends Disposable {
    public readonly id: string;

    private _dataSource: ChartDataSource;
    private _dataSource$: Observable<ChartDataSource>;
    get dataSource() { return this._dataSource; }

    /** chart type */
    private _chartType$ = new BehaviorSubject<ChartType>(ChartType.Line);
    chartType$ = this._chartType$.asObservable();
    get chartType() {
        return this._chartType$.getValue();
    }

    /** chart data config */
    private _dataConfig$ = new BehaviorSubject<IChartDataConfig>({});
    dataConfig$ = this._dataConfig$.asObservable();
    get dataConfig() { return this._dataConfig$.getValue(); }

    /** chart  config */
    private _config$ = new BehaviorSubject<IChartConfig | null>(null);
    config$ = this._config$.asObservable();

    /** chart style config */
    private _style$ = new BehaviorSubject<ChartStyle>({});
    style$ = this._style$.asObservable();
    public style: ChartStyle = {};

    constructor(private _option: IChartModelOption) {
        super();

        const { id, chartType, dataSource$, dataConfig, style } = _option;
        this.id = id || Tools.generateRandomId();

        this._dataSource$ = dataSource$;

        if (chartType) {
            this.setChart(chartType);
        }
        if (dataConfig) {
            this.applyDataConfig(dataConfig);
        }

        if (style) {
            this.applyStyle(style);
        }

        this._init();
    }

    private _init() {
        const { convertConfig } = this._option;

        const dataSourceContextTap: IChartDataPipelineOperator = (ctx) => {
            this._dataSource = ctx.dataSource;
            // When data source changed with rebuild data context,
            // It will bring data config modify, we need to update the data config
            this._dataConfig$.next(ctx.dataConfig);
        };
        const dataSourceWithConfigTap: IChartDataPipelineOperator = (ctx) => {
            this._dataSource = ctx.dataSource;
        };

        dataSourcePipeline
            .pipe(dataSourceContextTap);
        outputPipeline
            .pipe(dataSourceWithConfigTap);

        this.disposeWithMe(() => {
            dataSourcePipeline.unpipe(dataSourceContextTap);
            outputPipeline.unpipe(dataSourceWithConfigTap);
        });

        this.disposeWithMe(
            combineLatest([
                this.chartType$.pipe(distinctUntilChanged()),
                this._dataSource$
                    .pipe(
                        map((dataSource) => dataSourcePipeline.buildContext(dataSource, this.dataConfig)),
                        tap((ctx) => this._initStyleByContext(ctx)),
                        map((ctx) => ctx.dataSource)
                    ),
                this._dataConfig$,
            ]).pipe(
                debounceTime(0),
                filter(([chartType]) => Boolean(chartType)),
                map(([chartType, dataSource, dataConfig]) => [chartType, outputPipeline.buildContext(dataSource, dataConfig)] as const)
            )
                .subscribe(([_chartType, outputCtx]) => {
                    // console.log(ctx, ctx.dataConfig, 'ctx');
                    const chartType = _chartType!;

                    const chartData = ChartDataPipeline.getOutput(outputCtx);
                    const chartConfig = convertConfig(chartType, chartData);
                    // console.log(chartConfig, 'chartConfig');
                    if (chartConfig) {
                        this._config$.next(chartConfig);
                    }
                })
        );
    }

    private _initStyleByContext(ctx: IChartDataPipelineContext) {
        const { style } = this;
        const { dataConfig, dataSource } = ctx;
            // Init style by data config
        if (style.common?.title?.content === undefined) {
            const headers = dataConfig.headers;
            const category = dataConfig.categoryIndex !== undefined ? dataSource[dataConfig.categoryIndex] : [];

            this.applyStyle({
                common: {
                    title: {
                        content: headers?.join(',') ?? category.join(','),
                    },
                },
            });
        }
    }

    getDataByIndex(index: number) {
        return this._dataSource[index];
    }

    applyStyle(newStyle: ChartStyle) {
        this._style$.next(Tools.deepMerge(this.style, newStyle));
    }

    applyDataConfig(config: Partial<IChartDataConfig>) {
        this._dataConfig$.next(Tools.deepMerge(this._dataConfig$.getValue(), config));
    }

    setChart(type: ChartType) {
        this._chartType$.next(type);
    }

    onDispose(effect: () => void) {
        this.disposeWithMe(effect);
    }

    override dispose(): void {
        super.dispose();

        this._chartType$.complete();
        this._config$.complete();
    }
}
