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

import { Disposable, generateRandomId, Tools } from '@univerjs/core';
import type { Observable, Subscription } from 'rxjs';
import { BehaviorSubject, combineLatest, combineLatestWith, debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { aggregateOperator, buildChartData, dataDirectionToColumn, findCategoryOperator, findHeaderOperator, findSeriesOperator, topNOperator } from './chart-data-operators';
import { ChartTypeBits, DataDirection } from './constants';
import type { ChartStyle } from './style.types';
import type { ChartDataSource, IChartConfig, IChartDataContext, IChartDataTransformConfig } from './types';

export interface IChartModelInit {
    chartType?: ChartTypeBits;
    dataSource$: Observable<ChartDataSource>;
    dataTransformConfig?: IChartDataTransformConfig;
    // direction?: DataDirection;
    chartStyle?: ChartStyle;
    // toChartConfig: (chartType: ChartTypeBits, chartData: IChartData) => Nullable<IChartConfig>;
}

export class ChartModel extends Disposable {
    private _dataSource: ChartDataSource;
    private _dataSource$: Observable<ChartDataSource>;
    get dataSource() { return this._dataSource; }

    /** chart data source config */
    private _dataTransformConfig$: BehaviorSubject<IChartDataTransformConfig>;
    dataTransformConfig$: Observable<IChartDataTransformConfig>;
    get dataTransformConfig() { return this._dataTransformConfig$.getValue(); }

    /** chart type */
    private _chartType$ = new BehaviorSubject<ChartTypeBits>(ChartTypeBits.Line);
    chartType$ = this._chartType$.asObservable();
    get chartType() {
        return this._chartType$.getValue();
    }

    /** chart data config */
    private _dataContext$ = new BehaviorSubject<IChartDataContext>({});
    dataContext$ = this._dataContext$.asObservable();
    get dataContext() { return this._dataContext$.getValue(); }

    /** chart config, the output of chat model */
    private _config$ = new BehaviorSubject<IChartConfig | null>(null);
    config$ = this._config$.asObservable();

    /** chart style config */
    private _style$ = new BehaviorSubject<ChartStyle>({});
    style$ = this._style$.asObservable();
    get style() { return this._style$.getValue (); }

    private _configSubscription: Subscription;

    constructor(public readonly id: string, private _options: IChartModelInit) {
        super();

        const { chartType, dataSource$, chartStyle, dataTransformConfig } = _options;
        this.id = id || generateRandomId();

        if (chartType) {
            this.setChartType(chartType);
        }
        // if (direction) {
        //     this.assignDataContext({
        //         defaultDirection: direction,
        //         direction,
        //     });
        // }
        if (chartStyle) {
            this.setStyle(chartStyle);
        }

        const direction = dataTransformConfig?.direction || DataDirection.Row;
        const transformConfig: IChartDataTransformConfig = {
            ...dataTransformConfig,
            direction,
            defaultDirection: dataTransformConfig?.defaultDirection || direction,
        };
        this._dataTransformConfig$ = new BehaviorSubject(transformConfig);
        this.dataTransformConfig$ = this._dataTransformConfig$.asObservable();

        this.setDataSource(dataSource$);
    }

    setDataSource(dataSource$: Observable<ChartDataSource>) {
        this._dataSource$ = dataSource$;
        this._init();
    }

    private _init() {
        this._configSubscription?.unsubscribe();

        // Flag to recognize the new series and category of data source
        let initiated = false;
        const direction$ = this.dataTransformConfig$.pipe(
            map((config) => config.direction),
            distinctUntilChanged(),
            tap(() => [
                initiated = false,
            ])
        );

        const dataSource$ = this._dataSource$.pipe(
            combineLatestWith(direction$),
            map(([_dataSource, direction]) => {
                const dataSource = _dataSource.slice();
                this._dataSource = direction === DataDirection.Column ? dataDirectionToColumn(dataSource) : dataSource;

                return this._dataSource;
            }),
            tap((dataSource) => {
                if (!initiated) {
                    this._initWithDataSource(dataSource);
                }
                initiated = true;
            })
        );

        const combinedDataSource$ = dataSource$.pipe(
            combineLatestWith(this.dataTransformConfig$, this.dataContext$),
            map(([dataSource, dataTransformConfig, dataContext]) => {
                const ctx = { dataSource, dataTransformConfig, dataContext };

                const operators = [
                    dataTransformConfig.aggregate && aggregateOperator,
                    dataTransformConfig.topN && topNOperator,
                ].filter((operator) => !!operator);

                operators.forEach((operator) => operator(ctx));

                return ctx;
            })
        );

        this._configSubscription = combineLatest([
            this.chartType$.pipe(distinctUntilChanged()),
            combinedDataSource$,
        ]).pipe(
            debounceTime(100),
            filter(([chartType]) => Boolean(chartType))
        )
            .subscribe(([chartType, { dataSource, dataContext }]) => {
                // console.log(dataContext, dataSource, 'dataContext');
                // const { toChartConfig } = this._options;
                // const chartType = _chartType;

                const chartData = buildChartData(dataSource, dataContext);
                // const chartConfig = toChartConfig(chartType, chartData);

                // if (chartConfig) {
                this._config$.next({
                    type: chartType,
                    category: chartData.category,
                    series: chartData.series,
                });
                // }
            });

        this.disposeWithMe(this._configSubscription);
    }

    private _buildContext(dataSource: ChartDataSource, dataContext: IChartDataContext) {
        const operators = [
            findHeaderOperator,
            findCategoryOperator,
            findSeriesOperator,
        ];

        const ctx = {
            dataSource,
            dataContext,
            dataTransformConfig: this.dataTransformConfig,
        };

        operators.forEach((operator) => operator(ctx));

        return ctx.dataContext;
    }

    private _initWithDataSource(dataSource: ChartDataSource) {
        const dataContext = this._buildContext(dataSource, this.dataContext);
        // build series and category when data source change
        this._dataContext$.next(dataContext);

        const { style } = this;
        // console.log(dataContext.headers, 'dataContext.headers');
          // init title
        if (style.common?.title?.content === undefined) {
            this.applyStyle({
                common: {
                    title: {
                        content: dataContext.headers?.join(','),
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

    setStyle(style: ChartStyle | ((style: ChartStyle) => ChartStyle)) {
        const newStyle = typeof style === 'function' ? style(this.style) : style;
        this._style$.next(newStyle);
    }

    assignDataContext(context: Partial<IChartDataContext>) {
        const dataContext = Object.assign({}, this._dataContext$.getValue(), context);
        this._dataContext$.next(dataContext);
    }

    setDataContext(context: IChartDataContext | ((context: IChartDataContext) => IChartDataContext)) {
        const newContext = typeof context === 'function' ? context(this.dataContext) : context;
        this._dataContext$.next(newContext);
    }

    assignDataTransformConfig(config: Partial<IChartDataTransformConfig>) {
        const newConfig = Object.assign({}, this._dataTransformConfig$.getValue(), config);
        this._dataTransformConfig$.next(newConfig);
    }

    setDataTransformConfig(config: IChartDataTransformConfig | ((config: IChartDataTransformConfig) => IChartDataTransformConfig)) {
        const newConfig = typeof config === 'function' ? config(this._dataTransformConfig$.getValue()) : config;
        this._dataTransformConfig$.next(newConfig);
    }

    setChartType(type: ChartTypeBits) {
        this._chartType$.next(type);
    }

    onDispose(effect: () => void) {
        this.disposeWithMe(effect);
    }

    override dispose(): void {
        super.dispose();

        this._chartType$.complete();
        this._dataContext$.complete();
        this._config$.complete();
        this._style$.complete();
    }
}
