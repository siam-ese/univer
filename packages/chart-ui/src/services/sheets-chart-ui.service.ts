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
import { Disposable, Inject, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import type { AreaLineStyle, ChartModel, ChartTypeBits, DataDirection, DeepPartial, IAllSeriesStyle, IChartDataContext, ILabelStyle, ILegendStyle, InvalidValueType, IPieLabelStyle, ISeriesStyle, IXAxisOptions, IYAxisOptions, RadarShape } from '@univerjs/chart';
import { CategoryType, ChartAttributeBits, chartBitsUtils, SheetsChartConfigService, SheetsChartService, StackType } from '@univerjs/chart';
import { combineLatestWith, distinctUntilChanged, map, type Observable } from 'rxjs';

function formatAxisOptionLabel(column: number, dataRange: IRange) {
    return `${Tools.chatAtABC(column)}${dataRange.startRow + 1}:${Tools.chatAtABC(column)}${dataRange.endRow + 1}`;
}

// eslint-disable-next-line max-lines-per-function
export function registryChartConfigState(service: SheetsChartUIService) {
    service.registerViewState('headers', (chartModel) => chartModel.dataContext$.pipe(map((config) => config.headers)));
    service.registerViewState('chartType', (chartModel) => ({
        set(type) {
            if (chartBitsUtils.has(type, ChartAttributeBits.Stack)) {
                chartModel.applyStyle({
                    common: {
                        stackType: StackType.Stacked,
                    },
                });
            }
            if (chartBitsUtils.has(type, ChartAttributeBits.PercentStack)) {
                chartModel.applyStyle({
                    common: {
                        stackType: StackType.Percent,
                    },
                });
            }

            chartModel.setChartType(type);
        },
        get() {
            return chartModel.chartType$;
        },
    }));
    service.registerViewState('stackType', (chartModel) => ({
        set(v) {
            chartModel.applyStyle({
                common: {
                    stackType: v || undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.stackType),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('dataRange', (chartModel) => ({
        set(v) {
            if (v) {
                const dataSource = service.getDataSource(chartModel.id);
                if (dataSource) {
                    // Trigger update data source
                    dataSource.setRange(v);

                    chartModel.assignDataContext({
                        categoryIndex: undefined,
                        categoryType: undefined,
                        seriesIndexes: undefined,
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
            chartModel.assignDataContext({
                categoryIndex: v,
            });
        },
        get() {
            return chartModel.dataContext$.pipe(
                map((dataContext) => dataContext.categoryIndex),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('categoryList', (chartModel) => {
        const dataSourceRange$ = service.getDataSource(chartModel.id)?.range$;
        if (!dataSourceRange$) {
            return chartModel.dataContext$.pipe(map(() => []));
        }
        return chartModel.dataContext$.pipe(
            combineLatestWith(dataSourceRange$),
            map(([dataContext, dataRange]) => {
                const { categoryResourceIndexes, seriesResourceIndexes, headers } = dataContext;
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
            chartModel.assignDataContext({
                seriesIndexes: values,
            });
        },
        get() {
            return chartModel.dataContext$.pipe(map((dataContext) => {
                const { seriesIndexes = [] } = dataContext;

                return seriesIndexes;
            }));
        },
    }));
    service.registerViewState('seriesList', (chartModel) => ({
        get() {
            const dataSourceRange$ = service.getDataSource(chartModel.id)?.range$;
            if (!dataSourceRange$) {
                return chartModel.dataContext$.pipe(map(() => []));
            }

            return chartModel.dataContext$.pipe(
                combineLatestWith(dataSourceRange$),
                map(([dataContext, dataRange]) => {
                    const { seriesIndexes = [], headers } = dataContext;

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
        },
    }));
    service.registerViewState('seriesResourceList', (chartModel) => ({
        get() {
            const dataSourceRange$ = service.getDataSource(chartModel.id)?.range$;
            if (!dataSourceRange$) {
                return chartModel.dataContext$.pipe(map(() => []));
            }

            return chartModel.dataContext$.pipe(
                combineLatestWith(dataSourceRange$),
                map(([dataContext, dataRange]) => {
                    const { seriesResourceIndexes = [], headers } = dataContext;

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
        },
    }));
    service.registerViewState('aggregate', (chartModel) => ({
        set(value) {
            chartModel.assignDataTransformConfig({
                aggregate: value,
            });
        },
        get() {
            return chartModel.dataTransformConfig$.pipe(
                map((config) => config.aggregate || false),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('direction', (chartModel) => ({
        set(value) {
            if (value) {
                // const id = chartModel.id;
                // const dataSource = service.getDataSource(id);
                chartModel.assignDataTransformConfig({
                    direction: value,
                    // categoryIndex: undefined,
                    // categoryType: undefined,
                    // seriesIndexes: undefined,
                });
                // if (dataSource) {
                    // Trigger update data source

                    // dataSource.setRange(dataSource.range);
                // }
            }
        },
        get() {
            return chartModel.dataTransformConfig$.pipe(
                map((config) => config.direction),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('defaultDirection', (chartModel) => chartModel.dataTransformConfig$.pipe(map((config) => config.defaultDirection)));

    service.registerViewState('gradientFill', (chartModel) => ({
        set(v) {
            chartModel.applyStyle({
                common: {
                    gradientFill: v,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => Boolean(style.common?.gradientFill)),
                distinctUntilChanged()
            );
        },
    }));

    service.registerViewState('asCategory', (chartModel) => ({
        set(option) {
            const { dataContext } = chartModel;
            const seriesIncludes = (idx: number) => dataContext.seriesResourceIndexes?.indexOf(idx) !== -1;

            if (option) { // checked
                const categoryIndex = Number(option.value);

                const newDataConfig: Partial<IChartDataContext> = {
                    categoryIndex,
                    categoryType: CategoryType.Text,
                };
                if (seriesIncludes(categoryIndex)) {
                    // the category index is in series indexes, remove it
                    newDataConfig.seriesIndexes = dataContext.seriesIndexes?.filter((index) => index !== categoryIndex);
                }

                chartModel.assignDataContext(newDataConfig);
            } else if (typeof dataContext.categoryIndex === 'number') { // unchecked
                const newDataConfig: Partial<IChartDataContext> = {
                    categoryIndex: undefined,
                    categoryType: undefined,
                };
                if (seriesIncludes(dataContext.categoryIndex)) {
                    newDataConfig.seriesIndexes = [dataContext.categoryIndex].concat(dataContext.seriesIndexes || []);
                }
                chartModel.assignDataContext(newDataConfig);
            }
        },
        get() {
            return chartModel.dataContext$.pipe(map((dataContext) => {
                const dataSource = service.getDataSource(chartModel.id);
                if (dataSource) {
                    const categoryIndex = dataContext.categoryIndex
                        ?? dataContext.categoryResourceIndexes?.[0]
                        ?? dataContext.seriesResourceIndexes?.[0];
                    const columnValue = dataSource.range.startColumn + categoryIndex!;

                    return {
                        label: String(columnValue),
                        value: String(categoryIndex),
                    };
                }
            }));
        },
    }));

    service.registerViewState('backgroundColor', (chartModel) => ({
        set(color) {
            chartModel.applyStyle({
                common: {
                    backgroundColor: color ?? undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.backgroundColor),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('borderColor', (chartModel) => ({
        set(color) {
            chartModel.applyStyle({
                common: {
                    borderColor: color ?? undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.borderColor),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('fontSize', (chartModel) => ({
        set(fontSize) {
            chartModel.applyStyle({
                common: {
                    fontSize,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.fontSize),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('titleFontSize', (chartModel) => ({
        set(fontSize) {
            chartModel.applyStyle({
                common: {
                    titleFontSize: fontSize,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.titleFontSize),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('titleStyle', (chartModel) => ({
        set(style) {
            chartModel.applyStyle({
                common: {
                    title: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.title),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('subtitleStyle', (chartModel) => ({
        set(style) {
            chartModel.applyStyle({
                common: {
                    subtitle: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(
                map((style) => style.common?.subtitle),
                distinctUntilChanged()
            );
        },
    }));
    service.registerViewState('xAxisTitleStyle', (chartModel) => ({
        set(style) {
            chartModel.applyStyle({
                common: {
                    xAxisTitle: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.xAxisTitle), distinctUntilChanged());
        },
    }));
    service.registerViewState('yAxisTitleStyle', (chartModel) => ({
        set(style) {
            chartModel.applyStyle({
                common: {
                    yAxisTitle: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.yAxisTitle), distinctUntilChanged());
        },
    }));

    service.registerViewState('yAxisTitleStyle', (chartModel) => ({
        set(style) {
            chartModel.applyStyle({
                common: {
                    yAxisTitle: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.yAxisTitle), distinctUntilChanged());
        },
    }));

    service.registerViewState('allSeriesStyle', (chartModel) => ({
        set(style) {
            chartModel.applyStyle({
                common: {
                    allSeriesStyle: style,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.allSeriesStyle));
        },
    }));
    service.registerViewState('seriesStyleMap', (chartModel) => {
        return chartModel.style$.pipe(
            map((style) => style.common?.seriesStyleMap),
            map((seriesStyleMap) => {
                return {
                    get(id) {
                        return seriesStyleMap?.[id];
                    },
                    set(id, style) {
                        chartModel.applyStyle({
                            common: {
                                seriesStyleMap: {
                                    [id]: style,
                                },
                            },
                        });
                    },
                };
            }));
    });
    service.registerViewState('legendStyle', (chartModel) => ({
        set(legend) {
            chartModel.applyStyle({
                common: {
                    legend,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.legend));
        },
    }));
    service.registerViewState('xAxisOptions', (chartModel) => ({
        set(options) {
            chartModel.applyStyle({
                common: {
                    xAxis: options,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.xAxis));
        },
    }));
    service.registerViewState('yAxisOptions', (chartModel) => ({
        set(options) {
            chartModel.applyStyle({
                common: {
                    yAxis: options,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.yAxis));
        },
    }));
    service.registerViewState('areaLineStyle', (chartModel) => ({
        set(lineStyle) {
            chartModel.applyStyle({
                area: {
                    lineStyle: lineStyle ?? undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.area?.lineStyle));
        },
    }));
    service.registerViewState('pieLabelStyle', (chartModel) => ({
        set(labelStyle) {
            chartModel.applyStyle({
                pie: {
                    labelStyle: labelStyle ?? undefined,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.pie?.labelStyle));
        },
    }));
    service.registerViewState('doughnutHole', (chartModel) => ({
        set(value) {
            chartModel.applyStyle({
                pie: {
                    doughnutHole: value,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.pie?.doughnutHole), distinctUntilChanged());
        },
    }));
    service.registerViewState('radarShape', (chartModel) => ({
        set(value) {
            chartModel.applyStyle({
                radar: {
                    shape: value,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.radar?.shape), distinctUntilChanged());
        },
    }));
    service.registerViewState('radarFill', (chartModel) => ({
        set(value) {
            chartModel.applyStyle({
                radar: {
                    fill: value,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.radar?.fill), distinctUntilChanged());
        },
    }));
    service.registerViewState('invalidValueType', (chartModel) => ({
        set(value) {
            chartModel.applyStyle({
                common: {
                    invalidValueType: value,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.invalidValueType), distinctUntilChanged());
        },
    }));
};

export interface IChartOptionType {
    label: string;
    value: string;
}

export interface IChartConfigStateMap {
    headers: IChartConfigState<IChartDataContext['headers']>;
    defaultDirection: IChartConfigState<Nullable<DataDirection>>;
    direction: IChartConfigState<Nullable<DataDirection>>;
    aggregate: IChartConfigState<boolean>;
    gradientFill: IChartConfigState<boolean>;
    stackType: IChartConfigState<Nullable<StackType>>;
    chartType: IChartConfigState<ChartTypeBits>;
    dataRange: IChartConfigState<Nullable<IRange>>;
    categoryIndex: IChartConfigState<Nullable<number>>;
    categoryList: IChartConfigState<IChartOptionType[]>;
    seriesValues: IChartConfigState<number[]>;
    seriesList: IChartConfigState<IChartOptionType[]>;
    seriesResourceList: IChartConfigState<IChartOptionType[]>;
    asCategory: IChartConfigState<Nullable<IChartOptionType>>;
    backgroundColor: IChartConfigState<Nullable<string>>;
    borderColor: IChartConfigState<Nullable<string>>;
    fontSize: IChartConfigState<number | undefined, number>;
    titleFontSize: IChartConfigState<number | undefined, number>;
    titleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    subtitleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    xAxisTitleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    yAxisTitleStyle: IChartConfigState< Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    allSeriesStyle: IChartConfigState< Nullable<DeepPartial<IAllSeriesStyle>>, IAllSeriesStyle>;
    seriesStyleMap: IChartConfigState<{ get(id: string): DeepPartial<ISeriesStyle> | undefined; set(id: string, style: DeepPartial<ISeriesStyle>): void }>;
    legendStyle: IChartConfigState<Nullable<DeepPartial<ILegendStyle>>, Partial<ILegendStyle>>;
    xAxisOptions: IChartConfigState<Nullable<DeepPartial<IXAxisOptions>>, Partial<IXAxisOptions>>;
    yAxisOptions: IChartConfigState<Nullable<DeepPartial<IYAxisOptions>>, Partial<IYAxisOptions>>;
    areaLineStyle: IChartConfigState<Nullable<AreaLineStyle>>;
    pieLabelStyle: IChartConfigState<Nullable<DeepPartial<IPieLabelStyle>>>;
    doughnutHole: IChartConfigState<Nullable<number>, number>;
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
        @Inject(SheetsChartConfigService) private readonly _sheetsChartConfigService: SheetsChartConfigService,
        @Inject(SheetsChartService) private readonly _sheetsChartService: SheetsChartService

    ) {
        super();
        registryChartConfigState(this);
    }

    get activeChartModel() {
        return this._sheetsChartConfigService.activeChartModel;
    }

    getDataSource(id: string) {
        return this._sheetsChartService.getChartDataSource(id);
    }

    registerViewState<T extends ChartConfigStateKey = ChartConfigStateKey>(id: T, state: (chartModel: ChartModel) => IChartConfigStateMap[T]) {
        this._viewState.set(id, state);
    }

    getViewState<V extends ChartConfigStateValue = ChartConfigStateValue>(id: ChartConfigStateKey): IChartConfigState<V> | undefined {
        const { activeChartModel } = this._sheetsChartConfigService;
        if (!activeChartModel) {
            return;
        }
        const viewState = this._viewState.get(id) as ((chartModel: ChartModel) => IChartConfigState<V>) | undefined;
        if (viewState) {
            return viewState(activeChartModel);
        }
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
