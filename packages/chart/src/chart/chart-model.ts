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
import { Disposable, generateRandomId, Tools } from '@univerjs/core';
import type { Observable, Subscription } from 'rxjs';
import { BehaviorSubject, combineLatest, combineLatestWith, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { aggregateOperator, buildChartData, dataDirectionToColumn, findCategoryOperator, findHeaderOperator, findSeriesOperator } from './chart-data-operators';
import { ChartTypeBits, DataDirection } from './constants';
import type { ChartStyle } from './style.types';
import type { ChartDataSource, IChartConfig, IChartData, IChartDataConfig } from './types';

export interface IChartModelInit {
    chartType?: ChartTypeBits;
    dataSource$: Observable<ChartDataSource>;
    direction?: DataDirection;
    toChartConfig: (chartType: ChartTypeBits, chartData: IChartData) => Nullable<IChartConfig>;
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
    private _dataConfig$ = new BehaviorSubject<IChartDataConfig>({});
    dataConfig$ = this._dataConfig$.asObservable();
    get dataConfig() { return this._dataConfig$.getValue(); }

    /** chart  config */
    private _config$ = new BehaviorSubject<IChartConfig | null>(null);
    config$ = this._config$.asObservable();

    /** chart style config */
    private _style$ = new BehaviorSubject<ChartStyle>({});
    style$ = this._style$.asObservable();
    get style() { return this._style$.getValue (); }

    private _subscriptions: Subscription[] = [];

    constructor(public readonly id: string, private _options: IChartModelInit) {
        super();

        const { chartType, dataSource$, direction } = _options;
        this.id = id || generateRandomId();

        if (chartType) {
            this.setChartType(chartType);
        }
        if (direction) {
            this.assignDataConfig({
                defaultDirection: direction,
                direction,
            });
        }

        this.setDataSource(dataSource$);
    }

    setDataSource(dataSource$: Observable<ChartDataSource>) {
        this._dataSource$ = dataSource$;
        this._init();
    }

    private _init() {
        const { _subscriptions } = this;
        _subscriptions.forEach((sub) => sub.unsubscribe());

        const direction$ = this.dataConfig$.pipe(
            map((config) => config.direction),
            distinctUntilChanged()
        );

        const dataSource$ = this._dataSource$.pipe(
            combineLatestWith(direction$),
            map(([dataSource, direction]) => {
                this._dataSource = direction === DataDirection.Column ? dataDirectionToColumn(dataSource) : dataSource;

                return this._dataSource;
            })
        );

        const chartDataWithConfig$ = dataSource$.pipe(
            combineLatestWith(this.dataConfig$),
            map(([dataSource, dataConfig]) => {
                const context = { dataSource, dataConfig };
                const postOperators = [
                    aggregateOperator,
                ];
                postOperators.forEach((operator) => operator(context));

                return [context.dataSource, context.dataConfig] as const;
            })
        );

        _subscriptions[0] = dataSource$.subscribe((dataSource) => {
            const dataConfig = this._buildConfig(dataSource, this.dataConfig);
            // build series and category when data source change
            this._dataConfig$.next(dataConfig);
            // init style
            this._initStyle(dataSource, dataConfig);
            // Only subscribe once
            _subscriptions[0].unsubscribe();
        });

        _subscriptions[1] = combineLatest([
            this.chartType$.pipe(distinctUntilChanged()),
            chartDataWithConfig$,
        ]).pipe(
            debounceTime(100),
            filter(([chartType]) => Boolean(chartType))
        )
            .subscribe(([_chartType, [dataSource, dataConfig]]) => {
                const { toChartConfig } = this._options;
                const chartType = _chartType!;

                const chartData = buildChartData(dataSource, dataConfig);
                const chartConfig = toChartConfig(chartType, chartData);

                if (chartConfig) {
                    this._config$.next(chartConfig);
                }
            });

        this.disposeWithMe(() => {
            _subscriptions.forEach((sub) => sub.unsubscribe());
        });
    }

    private _buildConfig(dataSource: ChartDataSource, dataConfig: IChartDataConfig) {
        const operators = [
            findHeaderOperator,
            findCategoryOperator,
            findSeriesOperator,
        ];

        const ctx = {
            dataSource,
            dataConfig,
        };
        operators.forEach((operator) => operator(ctx));

        return ctx.dataConfig;
    }

    private _initStyle(dataSource: ChartDataSource, dataConfig: IChartDataConfig) {
        const { style } = this;
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

    assignDataConfig(config: Partial<IChartDataConfig>) {
        const dataConfig = Object.assign({}, this._dataConfig$.getValue(), config);
        this._dataConfig$.next(dataConfig);
    }

    setStyle(style: ChartStyle | ((style: ChartStyle) => ChartStyle)) {
        const newStyle = typeof style === 'function' ? style(this.style) : style;
        this._style$.next(newStyle);
    }

    setDataConfig(config: IChartDataConfig | ((config: IChartDataConfig) => IChartDataConfig)) {
        const newConfig = typeof config === 'function' ? config(this.dataConfig) : config;
        this._dataConfig$.next(newConfig);
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
        this._dataConfig$.complete();
        this._config$.complete();
        this._style$.complete();
    }
}
