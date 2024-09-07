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
import { aggregateOperator, buildChartData, dataDirectionToColumn, findCategoryOperator, findHeaderOperator, findSeriesOperator } from './chart-data-operators';
import { ChartTypeBits, DataDirection } from './constants';
import type { ChartStyle } from './style.types';
import type { ChartDataSource, IChartConfig, IChartDataContext } from './types';

export interface IChartModelInit {
    chartType?: ChartTypeBits;
    dataSource$: Observable<ChartDataSource>;
    direction?: DataDirection;
    chartStyle?: ChartStyle;
    // toChartConfig: (chartType: ChartTypeBits, chartData: IChartData) => Nullable<IChartConfig>;
}

export class ChartModel extends Disposable {
    private _dataSource: ChartDataSource;
    private _dataSource$: Observable<ChartDataSource>;
    get dataSource() { return this._dataSource; }

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

    /** chart  config */
    private _config$ = new BehaviorSubject<IChartConfig | null>(null);
    config$ = this._config$.asObservable();

    /** chart style config */
    private _style$ = new BehaviorSubject<ChartStyle>({});
    style$ = this._style$.asObservable();
    get style() { return this._style$.getValue (); }

    private _configSubscription: Subscription;
    // private _subscriptions: Subscription[] = [];

    constructor(public readonly id: string, private _options: IChartModelInit) {
        super();

        const { chartType, dataSource$, direction, chartStyle } = _options;
        this.id = id || generateRandomId();

        if (chartType) {
            this.setChartType(chartType);
        }
        if (direction) {
            this.assignDataContext({
                defaultDirection: direction,
                direction,
            });
        }
        if (chartStyle) {
            this.setStyle(chartStyle);
        }

        this.setDataSource(dataSource$);
    }

    setDataSource(dataSource$: Observable<ChartDataSource>) {
        this._dataSource$ = dataSource$;
        this._init();
    }

    private _init() {
        this._configSubscription?.unsubscribe();

        const direction$ = this.dataContext$.pipe(
            map((config) => config.direction),
            distinctUntilChanged()
        );

        let initiated = false;
        const dataSource$ = this._dataSource$.pipe(
            combineLatestWith(direction$),
            map(([dataSource, direction]) => {
                this._dataSource = direction === DataDirection.Column ? dataDirectionToColumn(dataSource) : dataSource;

                return this._dataSource;
            }),
            tap((dataSource) => {
                if (initiated) {
                    return;
                }

                initiated = true;
                const dataContext = this._buildConfig(dataSource, this.dataContext);
                // build series and category when data source change
                this._dataContext$.next(dataContext);
                // init style
                this._initStyle(dataSource, dataContext);
            })
        );

        const chartDataWithConfig$ = dataSource$.pipe(
            combineLatestWith(this.dataContext$),
            map(([dataSource, dataContext]) => {
                const context = { dataSource, dataContext };
                const postOperators = [
                    aggregateOperator,
                ];
                postOperators.forEach((operator) => operator(context));

                return [context.dataSource, context.dataContext] as const;
            })
        );

        this._configSubscription = combineLatest([
            this.chartType$.pipe(distinctUntilChanged()),
            chartDataWithConfig$,
        ]).pipe(
            debounceTime(100),
            filter(([chartType]) => Boolean(chartType))
        )
            .subscribe(([_chartType, [dataSource, dataContext]]) => {
                // const { toChartConfig } = this._options;
                const chartType = _chartType!;

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

    private _buildConfig(dataSource: ChartDataSource, dataContext: IChartDataContext) {
        const operators = [
            findHeaderOperator,
            findCategoryOperator,
            findSeriesOperator,
        ];

        const ctx = {
            dataSource,
            dataContext,
        };
        operators.forEach((operator) => operator(ctx));

        return ctx.dataContext;
    }

    private _initStyle(dataSource: ChartDataSource, dataContext: IChartDataContext) {
        const { style } = this;
            // Init style by data config
        if (style.common?.title?.content === undefined) {
            const headers = dataContext.headers;
            const category = dataContext.categoryIndex !== undefined ? dataSource[dataContext.categoryIndex] : [];

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

    assignDataContext(context: Partial<IChartDataContext>) {
        const dataContext = Object.assign({}, this._dataContext$.getValue(), context);
        this._dataContext$.next(dataContext);
    }

    setStyle(style: ChartStyle | ((style: ChartStyle) => ChartStyle)) {
        const newStyle = typeof style === 'function' ? style(this.style) : style;
        this._style$.next(newStyle);
    }

    setDataContext(context: IChartDataContext | ((context: IChartDataContext) => IChartDataContext)) {
        const newContext = typeof context === 'function' ? context(this.dataContext) : context;
        this._dataContext$.next(newContext);
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
