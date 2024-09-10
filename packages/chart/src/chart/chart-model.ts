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
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { aggregateOperator, buildChartData, topNOperator } from './chart-data-operators';
import { ChartTypeBits } from './constants';
import { pieDataContextTransformer } from './data-context-transformers/pie-data-context-transformer';
import type { ChartStyle } from './style.types';
import type { IChartConfig, IChartContext, IChartDataAggregation, IChartDataSource, IChartSnapshot } from './types';

export interface IChartModelInit {
    chartType?: ChartTypeBits;
    dataSource: IChartDataSource;
    dataAggregation?: IChartDataAggregation;
    context?: Pick<IChartContext, 'categoryIndex' | 'seriesIndexes' | 'transform'>;
    style?: ChartStyle;
}

const DEBOUNCE_TIME = 100;

export class ChartModel extends Disposable {
    private _dataSource: IChartDataSource;

    /** chart data source config */
    private _dataAggregation$: BehaviorSubject<IChartDataAggregation>;
    readonly dataAggregation$: Observable<IChartDataAggregation>;
    get dataAggregation() { return this._dataAggregation$.getValue(); }

    /** chart type */
    private _chartType$ = new BehaviorSubject<ChartTypeBits>(ChartTypeBits.Line);
    readonly chartType$ = this._chartType$.asObservable();
    get chartType() {
        return this._chartType$.getValue();
    }

    /** chart data config */
    private _context$ = new BehaviorSubject<IChartContext>({});
    readonly context$ = this._context$.asObservable();
    get context() { return this._context$.getValue(); }

    /** chart config, the output of chat model */
    private _config$ = new BehaviorSubject<IChartConfig | null>(null);
    readonly config$ = this._config$.asObservable();

    /** chart style config */
    private _style$ = new BehaviorSubject<ChartStyle>({});
    readonly style$ = this._style$.asObservable();
    get style() { return this._style$.getValue (); }

    private _configSubscription: Subscription;

    constructor(public readonly id: string, private _options: IChartModelInit) {
        super();

        const { chartType, dataSource, style, dataAggregation, context } = _options;
        this.id = id || generateRandomId();

        if (chartType) {
            this.setChartType(chartType);
        }
        if (context) {
            this.assignChartContext(context);
        }
        if (style) {
            this.applyStyle(style);
        }

        this._dataAggregation$ = new BehaviorSubject(dataAggregation || {});
        this.dataAggregation$ = this._dataAggregation$.asObservable();

        this._dataSource = dataSource;
        this._init();
    }

    private _init() {
        this._configSubscription?.unsubscribe();
        // Flag to recognize the new series and category of data source

        const { data$ } = this._dataSource;
        // Transform data source with orient and prevent process of build chart config continue if no data
        const dataSource$ = data$.pipe(
            filter((dataSource) => {
                const noData = dataSource.length <= 0 && dataSource.every((row) => row.length <= 0);
                if (noData) {
                    // handle no data
                    this._config$.next({
                        type: this.chartType,
                        category: undefined,
                        series: [],
                    });
                }

                return !noData;
            })
        );

        const combinedDataSource$ = combineLatest([
            dataSource$,
            this.context$,
            this.dataAggregation$,
        ]).pipe(
            debounceTime(DEBOUNCE_TIME),
            map(([dataSource, context, dataAggregation]) => {
                const operators = [
                    dataAggregation.aggregate && aggregateOperator,
                    dataAggregation.topN && topNOperator,
                ].filter((operator) => !!operator);

                const newDataSource = operators.reduce((data, operator) => {
                    const newData = operator(data, context, dataAggregation);
                    return newData ?? data;
                }, dataSource);

                return [newDataSource, context, dataAggregation] as const;
            })
        );

        this._configSubscription = combineLatest([
            this.chartType$.pipe(distinctUntilChanged()),
            combinedDataSource$,
        ]).pipe(
            filter(([chartType]) => Boolean(chartType)),
            debounceTime(DEBOUNCE_TIME)
        )
            .subscribe(([chartType, [dataSource, context]]) => {
                const chartData = buildChartData(dataSource, context);
                this._config$.next({
                    type: chartType,
                    category: chartData.category,
                    series: chartData.series,
                });
            });

        this.disposeWithMe(this._configSubscription);
    }

    applyStyle(newStyle: ChartStyle) {
        this._style$.next(Tools.deepMerge(this.style, newStyle));
    }

    assignChartContext(context: Partial<IChartContext>) {
        const newContext = Object.assign({}, this._context$.getValue(), context);
        this._context$.next(newContext);
    }

    assignDataAggregation(config: Partial<IChartDataAggregation>) {
        const newConfig = Object.assign({}, this._dataAggregation$.getValue(), config);
        this._dataAggregation$.next(newConfig);
    }

    setChartType(type: ChartTypeBits) {
        const transformers = [
            pieDataContextTransformer,
        ];

        const oldType = this.chartType;
        const newType = type;
        transformers.forEach((transformer) => transformer(oldType, newType, this));

        this._chartType$.next(type);
    }

    serialize() {
        const { context, style, dataAggregation } = this;
        const copyStyle = { ...style };

        delete copyStyle.runtime;

        const chartSnapshot: IChartSnapshot = {
            id: this.id,
            chartType: this.chartType,
            context: {
                categoryIndex: context.categoryIndex,
                seriesIndexes: context.seriesIndexes,
                transform: context.transform,
            },
            style: copyStyle,
            dataAggregation,
        };

        return chartSnapshot;
    }

    onDispose(effect: () => void) {
        this.disposeWithMe(effect);
    }

    override dispose(): void {
        super.dispose();

        this._chartType$.complete();
        this._context$.complete();
        this._config$.complete();
        this._style$.complete();
    }
}
