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
import type { ChartModel, ChartType, DataDirection, DeepPartial, IAllSeriesStyle, IChartDataConfig, ILabelStyle, ILegendStyle, ISeriesStyle, IXAxisOptions, IYAxisOptions, StackType } from '@univerjs/chart';
import { CategoryType, SheetsChartConfigService, SheetsChartService } from '@univerjs/chart';
import { map, type Observable } from 'rxjs';
import type { ISelectProps } from '@univerjs/design';
// eslint-disable-next-line max-lines-per-function
export function registryChartConfigState(service: SheetsChartUIService) {
    service.registerViewState('stackType', (chartModel) => ({
        set(v) {
            if (v) {
                chartModel.applyStyle({
                    common: {
                        stackType: v,
                    },
                });
            }
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.stackType));
        },
    }));
    service.registerViewState('chartType', (chartModel) => ({
        set(v) {
            Tools.set(chartModel, 'style.common.stack', v);
            chartModel.setChart(v);
        },
        get() {
            return chartModel.chartType$;
        },
    }));

    service.registerViewState('dataRange', (chartModel) => ({
        set(v) {
            if (v) {
                const dataSource = service.getDataSource(chartModel.id);
                if (dataSource) {
                    // Trigger update data source
                    dataSource.setRange(v);

                    chartModel.applyDataConfig({
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
            chartModel.applyDataConfig({
                categoryIndex: v,
            });
        },
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => dataConfig.categoryIndex));
        },
    }));
    service.registerViewState('categoryList', (chartModel) => ({
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => {
                const { categoryResourceIndexes, seriesResourceIndexes, headers } = dataConfig;
                const indexes = categoryResourceIndexes?.concat(seriesResourceIndexes || [])
                    .sort((a, b) => (a || 0) - (b || 0));

                if (!indexes) {
                    return [];
                }

                const options = indexes.map((idx) => {
                    let label: string;
                    if (headers) {
                        label = headers[idx]?.toString() || '';
                    } else {
                        const values = chartModel.getDataByIndex(idx);
                        const firstValue = values.find((v) => v !== null && v !== undefined);
                        label = firstValue?.toString() || '';
                    }

                    return {
                        label,
                        value: String(idx),
                    };
                });

                return options;
            }));
        },
    }));
    service.registerViewState('seriesValues', (chartModel) => ({
        set(values) {
            chartModel.applyDataConfig({
                seriesIndexes: values,
            });
        },
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => {
                const { seriesIndexes = [] } = dataConfig;

                return seriesIndexes;
            }));
        },
    }));
    service.registerViewState('seriesList', (chartModel) => ({
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => {
                const { seriesResourceIndexes = [], headers } = dataConfig;

                const options = seriesResourceIndexes.map((col, index) => {
                    let label: string;
                    if (headers) {
                        label = headers[col]?.toString() || '';
                    } else {
                        // const values = chartModel.getDataByIndex(col);
                        // const firstValue = values.find((v) => v !== null && v !== undefined);
                        label = `系列 ${index + 1}`;
                    }

                    return {
                        label,
                        value: String(col),
                    };
                });

                return options;
            }));
        },
    }));
    service.registerViewState('aggregate', (chartModel) => ({
        set(value) {
            chartModel.applyDataConfig({
                aggregate: value,
            });
        },
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => dataConfig.aggregate || false));
        },
    }));

    service.registerViewState('direction', (chartModel) => ({
        set(value) {
            if (value) {
                const id = chartModel.id;
                const dataSource = service.getDataSource(id);
                if (dataSource) {
                    // Trigger update data source
                    chartModel.applyDataConfig({
                        direction: value,
                        categoryIndex: undefined,
                        categoryType: undefined,
                        seriesIndexes: undefined,
                    });
                    dataSource.setRange(dataSource.range);
                }
            }
        },
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => dataConfig.direction));
        },
    }));
    service.registerViewState('defaultDirection', (chartModel) => {
        return chartModel.dataConfig$.pipe(map((dataConfig) => dataConfig.defaultDirection));
    });
    service.registerViewState('asCategory', (chartModel) => ({
        set(option) {
            const { dataConfig } = chartModel;
            const seriesIncludes = (idx: number) => dataConfig.seriesResourceIndexes?.indexOf(idx) !== -1;

            if (option) { // checked
                const categoryIndex = Number(option.value);

                const newDataConfig: Partial<IChartDataConfig> = {
                    categoryIndex,
                    categoryType: CategoryType.Text,
                };
                if (seriesIncludes(categoryIndex)) {
                    // the category index is in series indexes, remove it
                    newDataConfig.seriesIndexes = newDataConfig.seriesIndexes?.filter((index) => index !== categoryIndex);
                }

                chartModel.applyDataConfig(newDataConfig);
            } else if (typeof dataConfig.categoryIndex === 'number') { // unchecked
                const newDataConfig: Partial<IChartDataConfig> = {
                    categoryIndex: undefined,
                    categoryType: undefined,
                };
                if (seriesIncludes(dataConfig.categoryIndex)) {
                    newDataConfig.seriesIndexes = [dataConfig.categoryIndex].concat(dataConfig.seriesIndexes || []);
                }
                chartModel.applyDataConfig(newDataConfig);
            }
        },
        get() {
            return chartModel.dataConfig$.pipe(map((dataConfig) => {
                const dataSource = service.getDataSource(chartModel.id);
                if (dataSource) {
                    const categoryIndex = dataConfig.categoryIndex
                        ?? dataConfig.categoryResourceIndexes?.[0]
                        ?? dataConfig.seriesResourceIndexes?.[0];
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
            return chartModel.style$.pipe(map((style) => style.common?.backgroundColor));
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
            return chartModel.style$.pipe(map((style) => style.common?.borderColor));
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
            return chartModel.style$.pipe(map((style) => style.common?.fontSize));
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
            return chartModel.style$.pipe(map((style) => style.common?.title));
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
            return chartModel.style$.pipe(map((style) => style.common?.subtitle));
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
            return chartModel.style$.pipe(map((style) => style.common?.xAxisTitle));
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
            return chartModel.style$.pipe(map((style) => style.common?.yAxisTitle));
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
            return chartModel.style$.pipe(map((style) => style.common?.yAxisTitle));
        },
    }));

    service.registerViewState('allSeriesStyle', (chartModel) => ({
        set(style) {
            // const seriesStyleMap: { [id: string]: DeepPartial<ISeriesStyle> } = {};
            // chartModel.dataConfig.seriesIndexes?.forEach((index) => {
            //     const key = String(index);
            //     seriesStyleMap[key] = style;
            // });
            chartModel.applyStyle({
                common: {
                    allSeriesStyle: style,
                    // seriesStyleMap,
                },
            });
        },
        get() {
            return chartModel.style$.pipe(map((style) => style.common?.allSeriesStyle));
        },
    }));
    service.registerViewState('seriesStyleMap', (chartModel) => {
        return chartModel.style$.pipe(map((style) => {
            const seriesStyleMap = style.common?.seriesStyleMap || {};
            return {
                get(id) {
                    return seriesStyleMap[id];
                },
                set(id, style) {
                    seriesStyleMap[id] = style;
                    chartModel.applyStyle({
                        common: {
                            seriesStyleMap,
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
};

type ExtractValuable<T> = T extends null | undefined ? never : T;
export type SelectOption = ExtractValuable<ISelectProps['options']>;

export interface IChartConfigStateMap {
    defaultDirection: IChartConfigState<Nullable<DataDirection>>;
    direction: IChartConfigState<Nullable<DataDirection>>;
    aggregate: IChartConfigState<boolean>;
    stackType: IChartConfigState<Nullable<StackType>>;
    chartType: IChartConfigState<ChartType>;
    dataRange: IChartConfigState<Nullable<IRange>>;
    categoryIndex: IChartConfigState<Nullable<number>>;
    categoryList: IChartConfigState<SelectOption>;
    seriesValues: IChartConfigState<number[]>;
    seriesList: IChartConfigState<SelectOption>;
    asCategory: IChartConfigState<Nullable<SelectOption[number]>>;
    backgroundColor: IChartConfigState<Nullable<string>>;
    borderColor: IChartConfigState<Nullable<string>>;
    fontSize: IChartConfigState<number | undefined, number>;
    titleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    subtitleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    xAxisTitleStyle: IChartConfigState<Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    yAxisTitleStyle: IChartConfigState< Nullable<DeepPartial<ILabelStyle>>, Partial<ILabelStyle>>;
    allSeriesStyle: IChartConfigState< Nullable<DeepPartial<IAllSeriesStyle>>, IAllSeriesStyle>;
    seriesStyleMap: IChartConfigState<{ get(id: string): DeepPartial<ISeriesStyle> | undefined; set(id: string, style: DeepPartial<ISeriesStyle>): void }>;
    legendStyle: IChartConfigState<Nullable<DeepPartial<ILegendStyle>>, Partial<ILegendStyle>>;
    xAxisOptions: IChartConfigState<Nullable<DeepPartial<IXAxisOptions>>, Partial<IXAxisOptions>>;
    yAxisOptions: IChartConfigState<Nullable<DeepPartial<IYAxisOptions>>, Partial<IYAxisOptions>>;
}

export type ChartConfigStateKey = keyof IChartConfigStateMap;
export type ChartConfigStateValue = InferChartConfigStateValue<ChartConfigStateKey>;

export type InferChartConfigStateValue<T extends ChartConfigStateKey, M = IChartConfigStateMap[T]> = M extends IChartConfigState<infer V> ? V : never;

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
