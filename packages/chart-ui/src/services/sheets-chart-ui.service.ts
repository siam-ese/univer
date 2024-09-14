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

import type { IRange, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, Inject, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import type { AreaLineStyle, ChartModel, ChartStyle, DataOrientation, DeepPartial, IAllSeriesStyle, IAxisOptions, IChartContext, IChartStyle, IChartUpdateConfigMutationParams, ILegendStyle, InvalidValueType, IPieLabelStyle, IRuntimeAxis, RadarShape, RightYAxisOptions } from '@univerjs/chart';
import { CategoryType, ChartAttributeBits, chartBitsUtils, ChartModelService, ChartTypeBits, ChartUpdateConfigMutation, SheetsChartService, StackType } from '@univerjs/chart';
import { combineLatestWith, distinctUntilChanged, map, type Observable } from 'rxjs';

function formatAxisOptionLabel(column: number, dataRange: IRange) {
    return `${Tools.chatAtABC(column)}${dataRange.startRow + 1}:${Tools.chatAtABC(column)}${dataRange.endRow + 1}`;
}

// eslint-disable-next-line max-lines-per-function
export function registryChartConfigState(service: SheetsChartUIService) {
    service.registerViewState('headers', (chartModel) => chartModel.context$.pipe(map((config) => config.headers)));
    service.registerViewState('chartType', (chartModel) => ({
        set(type) {
            const style: ChartStyle = {};
            if (chartBitsUtils.has(type, ChartAttributeBits.PercentStack)) {
                style.stackType = StackType.Percent;
            }
            if (chartBitsUtils.has(type, ChartAttributeBits.Stack)) {
                style.stackType = StackType.Stacked;
            }
            if (type === ChartTypeBits.Doughnut) {
                style.pie = {
                    doughnutHole: undefined,
                };
            }
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                chartType: type,
                style,
            });
        },
        get() {
            return chartModel.chartType$;
        },
    }));
    service.registerViewState('stackType', (chartModel) => ({
        set(v) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    stackType: v || undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.stackType),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('dataRange', (chartModel) => ({
        set(v) {
            if (v) {
                const dataSource = service.getDataSource(chartModel.id);
                if (dataSource) {
                    service.executeChartUpdateConfig({
                        chartModelId: chartModel.id,
                        range: v,
                        context: {
                            categoryIndex: undefined,
                            seriesIndexes: undefined,
                        },
                    });
                }
            }
        },
        get() {
            const dataSource = service.getDataSource(chartModel.id);
            return dataSource?.range$;
        },
    }));
    service.registerViewState('categoryIndex', (chartModel) => ({
        set(v) {
            if (typeof v !== 'number') {
                return;
            }
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                context: {
                    categoryIndex: v,
                },
            });
        },
        get() {
            return chartModel.context$.pipe(
                map((chartContext) => chartContext.categoryIndex),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('categoryType', (chartModel) => {
        return chartModel.context$.pipe(
            map((chartContext) => chartContext.categoryType),
            distinctUntilChanged()
        );
    });

    service.registerViewState('categoryList', (chartModel) => {
        const dataSourceRange$ = service.getDataSource(chartModel.id)?.range$;
        if (!dataSourceRange$) {
            return chartModel.context$.pipe(map(() => []));
        }
        return chartModel.context$.pipe(
            combineLatestWith(dataSourceRange$),
            map(([chartContext, dataRange]) => {
                const { categoryResourceIndexes, seriesResourceIndexes, headers } = chartContext;
                const indexes = categoryResourceIndexes?.concat(seriesResourceIndexes || [])
                    .sort((a, b) => (a || 0) - (b || 0));

                if (!indexes) {
                    return [];
                }

                const options = indexes.map((idx) => {
                    const header = headers?.[idx];
                    const label = header ?? formatAxisOptionLabel(dataRange.startColumn + idx, dataRange);

                    return {
                        label,
                        value: String(idx),
                    };
                });

                return options;
            })
        );
    });
    service.registerViewState('seriesValues', (chartModel) => ({
        set(values) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                context: {
                    seriesIndexes: values,
                },
            });
        },
        get() {
            return chartModel.context$.pipe(map((chartContext) => {
                const { seriesIndexes = [] } = chartContext;

                return seriesIndexes;
            }));
        },
    }));
    service.registerViewState('seriesList', (chartModel) => {
        const dataSourceRange$ = service.getDataSource(chartModel.id)?.range$;
        if (!dataSourceRange$) {
            return chartModel.context$.pipe(map(() => []));
        }

        return chartModel.context$.pipe(
            combineLatestWith(dataSourceRange$),
            map(([chartContext, dataRange]) => {
                const { seriesIndexes = [], headers } = chartContext;

                const options = seriesIndexes.map((idx) => {
                    const header = headers?.[idx];
                    const label = header ?? formatAxisOptionLabel(dataRange.startColumn + idx, dataRange);

                    return {
                        label,
                        value: String(idx),
                    };
                });

                return options;
            })
        );
    });
    service.registerViewState('seriesResourceList', (chartModel) => {
        const dataSourceRange$ = service.getDataSource(chartModel.id)?.range$;
        if (!dataSourceRange$) {
            return chartModel.context$.pipe(map(() => []));
        }

        return chartModel.context$.pipe(
            combineLatestWith(dataSourceRange$),
            map(([chartContext, dataRange]) => {
                const { seriesResourceIndexes = [], headers } = chartContext;

                const options = seriesResourceIndexes.map((idx) => {
                    const header = headers?.[idx];
                    const label = header ?? formatAxisOptionLabel(dataRange.startColumn + idx, dataRange);

                    return {
                        label,
                        value: String(idx),
                    };
                });

                return options;
            })
        );
    });
    service.registerViewState('aggregate', (chartModel) => ({
        set(value) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                dataAggregation: {
                    aggregate: value,
                },
            });
        },
        get() {
            return chartModel.dataAggregation$.pipe(
                map((config) => config.aggregate || false),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('orient', (chartModel) => ({
        set(value) {
            if (value) {
                service.executeChartUpdateConfig({
                    chartModelId: chartModel.id,
                    orient: value,
                    context: {
                        categoryIndex: undefined,
                        seriesIndexes: undefined,
                    },
                });
            }
        },
        get() {
            return service.getDataSource(chartModel.id)?.orient$;
        },
    }));
    // service.registerViewState('defaultDirection', (chartModel) => chartModel.chartDataAggregation$.pipe(map((config) => config.defaultDirection)));

    service.registerViewState('gradientFill', (chartModel) => ({
        set(v) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    gradientFill: v,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.gradientFill),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('asCategory', (chartModel) => ({
        set(checked) {
            const { context: chartContext } = chartModel;
            const seriesIncludes = (idx: number) => chartContext.seriesResourceIndexes?.indexOf(idx) !== -1;

            if (checked) { // checked
                const categoryIndex = chartContext.seriesIndexes?.[0];
                if (categoryIndex === undefined) {
                    return;
                }

                const newDataConfig: Partial<IChartContext> = {
                    categoryIndex,
                    categoryType: CategoryType.Text,
                };
                if (seriesIncludes(categoryIndex)) {
                    // the category index is in series indexes, remove it
                    newDataConfig.seriesIndexes = chartContext.seriesIndexes?.filter((index) => index !== categoryIndex);
                }

                service.executeChartUpdateConfig({
                    chartModelId: chartModel.id,
                    context: newDataConfig,
                });
            } else {
                if (chartContext.categoryIndex === undefined) {
                    return;
                }

                const newDataConfig: Partial<IChartContext> = {
                    categoryIndex: undefined,
                    categoryType: undefined,
                };

                if (seriesIncludes(chartContext.categoryIndex)) {
                    newDataConfig.seriesIndexes = [chartContext.categoryIndex].concat(chartContext.seriesIndexes || []);
                }

                service.executeChartUpdateConfig({
                    chartModelId: chartModel.id,
                    context: newDataConfig,
                });
            }
        },
        get() {
            return chartModel.context$.pipe(map((chartContext) => {
                if (chartContext.categoryIndex === undefined) {
                    return false;
                }
                return Boolean(chartContext.seriesResourceIndexes?.includes(chartContext.categoryIndex));
            }));
        },
    }));

    service.registerViewState('backgroundColor', (chartModel) => ({
        set(color) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    backgroundColor: color ?? undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style?.backgroundColor),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('borderColor', (chartModel) => ({
        set(color) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    borderColor: color ?? undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.borderColor),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('fontSize', (chartModel) => ({
        set(fontSize) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    fontSize,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.fontSize),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('titleFontSize', (chartModel) => ({
        set(fontSize) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    titleFontSize: fontSize,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.titleFontSize),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('titles', (chartModel) => ({
        set(style) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    titles: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.titles)
            );
        },
    }));
    // service.registerViewState('titleStyle', (chartModel) => ({
    //     set(style) {
    //         service.executeChartUpdateConfig({
    //             chartModelId: chartModel.id,
    //             style: {
    //                 title: style,
    //             },
    //         });
    //     },
    //     get() {
    //         return chartModel.style$.pipe(
    //             map((style) => style.title),
    //             distinctUntilChanged()
    //         );
    //     },
    // }));
    // service.registerViewState('subtitleStyle', (chartModel) => ({
    //     set(style) {
    //         service.executeChartUpdateConfig({
    //             chartModelId: chartModel.id,
    //             style: {
    //                 subtitle: style,
    //             },
    //         });
    //     },
    //     get() {
    //         return chartModel.style$.pipe(
    //             map((style) => style.subtitle),
    //             distinctUntilChanged()
    //         );
    //     },
    // }));
    // service.registerViewState('xAxisTitleStyle', (chartModel) => ({
    //     set(style) {
    //         service.executeChartUpdateConfig({
    //             chartModelId: chartModel.id,
    //             style: {
    //                 xAxisTitle: style,
    //             },
    //         });
    //     },
    //     get() {
    //         return chartModel.style$.pipe(map((style) => style.xAxisTitle));
    //     },
    // }));
    // service.registerViewState('yAxisTitleStyle', (chartModel) => ({
    //     set(style) {
    //         service.executeChartUpdateConfig({
    //             chartModelId: chartModel.id,
    //             style: {
    //                 yAxisTitle: style,
    //             },
    //         });
    //     },
    //     get() {
    //         return chartModel.style$.pipe(map((style) => style.yAxisTitle));
    //     },
    // }));

    service.registerViewState('allSeriesStyle', (chartModel) => ({
        set(style) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    allSeriesStyle: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.allSeriesStyle));
        },
    }));
    service.registerViewState('seriesStyleMap', (chartModel) => ({
        set(style) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    seriesStyleMap: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.seriesStyleMap));
        },
    }));
    service.registerViewState('legendStyle', (chartModel) => ({
        set(legend) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    legend,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.legend));
        },
    }));
    service.registerViewState('xAxisOptions', (chartModel) => ({
        set(options) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    xAxis: options,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.xAxis));
        },
    }));
    service.registerViewState('yAxisOptions', (chartModel) => ({
        set(options) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    yAxis: options,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.yAxis));
        },
    }));
    service.registerViewState('rightYAxisOptions', (chartModel) => ({
        set(options) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    rightYAxis: options,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.rightYAxis));
        },
    }));
    service.registerViewState('runtimeAxes', (chartModel) => {
        return chartModel.style$.pipe(map(() => chartModel.getRuntimeContext().axes));
    });
    service.registerViewState('areaLineStyle', (chartModel) => ({
        set(lineStyle) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    area: {
                        lineStyle: lineStyle ?? undefined,
                    },
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.area?.lineStyle));
        },
    }));
    service.registerViewState('pieLabelStyle', (chartModel) => ({
        set(labelStyle) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    pie: {
                        labelStyle: labelStyle ?? undefined,
                    },
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.pie?.labelStyle));
        },
    }));
    service.registerViewState('doughnutHole', (chartModel) => ({
        set(value) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    pie: {
                        doughnutHole: value,
                    },
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.pie?.doughnutHole), distinctUntilChanged());
        },
    }));
    service.registerViewState('pieBorderColor', (chartModel) => ({
        set(value) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    pie: {
                        borderColor: value,
                    },
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.pie?.borderColor), distinctUntilChanged());
        },
    }));
    service.registerViewState('radarShape', (chartModel) => ({
        set(value) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    radar: {
                        shape: value,
                    },
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.radar?.shape), distinctUntilChanged());
        },
    }));
    service.registerViewState('radarFill', (chartModel) => ({
        set(value) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    radar: {
                        fill: value,
                    },
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.radar?.fill), distinctUntilChanged());
        },
    }));
    service.registerViewState('invalidValueType', (chartModel) => ({
        set(value) {
            service.executeChartUpdateConfig({
                chartModelId: chartModel.id,
                style: {
                    invalidValueType: value,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.invalidValueType), distinctUntilChanged());
        },
    }));
    // service.registerViewState('hasRightYAxis', (chartModel) => {
    //     return chartModel.style$.pipe(
    //         map(() => {
    //             const runtimeAxes = chartModel.getRuntimeContext().axes;

    //             return runtimeAxes.some((axis) => axis.position === IRuntimeAxisPosition.Right);
    //         })
    //     );
    // });
};

export interface IChartOptionType {
    label: string;
    value: string;
}

export interface IChartConfigStateMap {
    headers: IChartConfigState<IChartContext['headers']>;
    // defaultDirection: IChartConfigState<Nullable<DataOrientation>>;
    orient: IChartConfigState<Nullable<DataOrientation>>;
    aggregate: IChartConfigState<boolean>;
    gradientFill: IChartConfigState<Nullable<boolean>>;
    stackType: IChartConfigState<Nullable<StackType>>;
    chartType: IChartConfigState<ChartTypeBits>;
    dataRange: IChartConfigState<Nullable<IRange>>;
    /** Series & Category */
    categoryIndex: IChartConfigState<Nullable<number>>;
    categoryType: IChartConfigState<Nullable<CategoryType>>;
    categoryList: IChartConfigState<IChartOptionType[]>;
    seriesValues: IChartConfigState<number[]>;
    seriesList: IChartConfigState<IChartOptionType[]>;
    seriesResourceList: IChartConfigState<IChartOptionType[]>;
    asCategory: IChartConfigState<boolean>;

    backgroundColor: IChartConfigState<Nullable<string>>;
    borderColor: IChartConfigState<Nullable<string>>;
    fontSize: IChartConfigState<number | undefined, number>;
    titleFontSize: IChartConfigState<number | undefined, number>;
    titles: IChartConfigState<Nullable<DeepPartial<IChartStyle['titles']>>, DeepPartial<IChartStyle['titles']>>;
    // hasRightYAxis: IChartConfigState<boolean>;
    // titleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, DeepPartial<ILabelStyle>>;
    // subtitleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, DeepPartial<ILabelStyle>>;
    // xAxisTitleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, DeepPartial<ILabelStyle>>;
    // yAxisTitleStyle: IChartConfigState< Nullable<DeepPartial<ILabelStyle>>, DeepPartial<ILabelStyle>>;
    allSeriesStyle: IChartConfigState< Nullable<DeepPartial<IAllSeriesStyle>>, IAllSeriesStyle>;
    seriesStyleMap: IChartConfigState<ChartStyle['seriesStyleMap']>;
    legendStyle: IChartConfigState<Nullable<DeepPartial<ILegendStyle>>, Partial<ILegendStyle>>;
    /** Axes */
    xAxisOptions: IChartConfigState<Nullable<DeepPartial<IAxisOptions>>, Partial<IAxisOptions>>;
    yAxisOptions: IChartConfigState<Nullable<DeepPartial<IAxisOptions>>, Partial<IAxisOptions>>;
    rightYAxisOptions: IChartConfigState<Nullable<DeepPartial<RightYAxisOptions>>, Partial<RightYAxisOptions>>;
    runtimeAxes: IChartConfigState<Nullable<IRuntimeAxis[]>>;

    areaLineStyle: IChartConfigState<Nullable<AreaLineStyle>>;
    pieLabelStyle: IChartConfigState<Nullable<DeepPartial<IPieLabelStyle>>>;
    doughnutHole: IChartConfigState<Nullable<number>, number>;
    pieBorderColor: IChartConfigState<Nullable<string>, string>;
    radarShape: IChartConfigState<Nullable<RadarShape>, RadarShape>;
    radarFill: IChartConfigState<Nullable<boolean>, boolean>;
    invalidValueType: IChartConfigState<Nullable<InvalidValueType>, InvalidValueType>;
}

export type ChartConfigStateKey = keyof IChartConfigStateMap;
export type ChartConfigStateValue = InferChartConfigStateValue<ChartConfigStateKey>;

export type InferChartConfigStateValue<T extends ChartConfigStateKey, M = IChartConfigStateMap[T]> = M extends IChartConfigState<infer V>
    ? V : never;

export type IChartConfigState<GetValue, SetValue = GetValue> = {
    set?(value: SetValue): void;
    get(): Observable<GetValue> | undefined;
} | Observable<GetValue>;

@OnLifecycle(LifecycleStages.Rendered, SheetsChartUIService)
export class SheetsChartUIService extends Disposable {
    private _viewState = new Map<ChartConfigStateKey, (chartModel: ChartModel) => IChartConfigStateMap[ChartConfigStateKey]>();

    constructor(
        @Inject(ChartModelService) private readonly _chartModelService: ChartModelService,
        @Inject(SheetsChartService) private readonly _sheetsChartService: SheetsChartService,
        @ICommandService private readonly _commandService: ICommandService

    ) {
        super();
        registryChartConfigState(this);
    }

    get activeChartModel() {
        return this._chartModelService.activeChartModel;
    }

    getDataSource(id: string) {
        return this._sheetsChartService.getChartDataSource(id);
    }

    registerViewState<T extends ChartConfigStateKey = ChartConfigStateKey>(id: T, state: (chartModel: ChartModel) => IChartConfigStateMap[T]) {
        this._viewState.set(id, state);
    }

    getViewState<V extends ChartConfigStateValue = ChartConfigStateValue>(id: ChartConfigStateKey): IChartConfigState<V> | undefined {
        const { activeChartModel } = this._chartModelService;
        if (!activeChartModel) {
            return;
        }
        const viewState = this._viewState.get(id) as ((chartModel: ChartModel) => IChartConfigState<V>) | undefined;
        if (viewState) {
            return viewState(activeChartModel);
        }
    }

    executeChartUpdateConfig(params: IChartUpdateConfigMutationParams) {
        this._commandService.executeCommand(ChartUpdateConfigMutation.id, params);
    }

    removeViewState(id: ChartConfigStateKey) {
        const { _viewState } = this;
        if (_viewState.has(id)) {
            _viewState.delete(id);
        }
    }

    override dispose() {
        super.dispose();
        this._viewState.clear();
    }
}
