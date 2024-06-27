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

import type { ChartDataSource, ChartDataSourceValue, IChartData, IChartDataContext } from './types';
import { CategoryType, DataDirection } from './constants';

type NestedArray<T = any> = Array<Array<T>>;

type Nil = null | undefined;

function isNil(value: any): value is Nil {
    return value === null || value === undefined;
}

function countTypesFromArray(ary: ChartDataSourceValue[]) {
    let numbers = 0;
    let strings = 0;

    ary.forEach((value) => {
        if (isNil(value)) {
            return;
        }
        if (typeof value === 'string') {
            strings += 1;
        }
        if (typeof value === 'number') {
            numbers += 1;
        }
    });

    return {
        numbers,
        strings,
    };
}

function toString(value: ChartDataSourceValue) {
    return isNil(value)
        ? ''
        : String(value);
}
function toNumber(value: ChartDataSourceValue) {
    return Number(value) || 0;
}

function dataDirectionToColumn<T = any>(dataSource: NestedArray<T>): NestedArray<T> {
    const table: Array<Array<T>> = [];

    for (let c = 0; c < dataSource[0].length; c++) {
        let column: Array<T> = [];
        for (let r = 0; r < dataSource.length; r++) {
            column.push(dataSource[r][c]);
        }
        table.push(column);
        column = [];
    }
    return table;
}

function findCategoryIndex(dataSource: NestedArray<ChartDataSourceValue>) {
    let categoryIndex = -1;
    let maxCount = 0;

    dataSource.forEach((items, index) => {
        const counts = countTypesFromArray(items);
        if (counts.strings > maxCount) {
            maxCount = counts.strings;
            categoryIndex = index;
        }
    });

    return categoryIndex;
}

function groupBy<T = any>(ary: T[], selector: (item: T, index: number) => string) {
    const groups = new Map<string, T[] >();
    ary.forEach((item, index) => {
        const group = selector(item, index);
        if (!groups.has(group)) {
            groups.set(group, []);
        }
        groups.get(group)?.push(item);
    });

    return Array.from(groups).map(([name, values]) => ({
        name,
        values,
    }));
}

function sumArray(ary: ChartDataSourceValue[]) {
    return ary.reduce((acc: number, item) => acc + toNumber(item), 0);
}

export type IChartDataPipelineOperator = (ctx: IChartDataPipelineContext) => void;
export interface IChartDataPipelineContext {
    dataSource: ChartDataSource;
    dataConfig: IChartDataContext;
    _headerData?: ChartDataSourceValue[];
}

export class ChartDataPipeline {
    private _operators: IChartDataPipelineOperator[] = [];

    pipe(...operators: IChartDataPipelineOperator[]) {
        this._operators = this._operators.concat(operators);
        return this;
    }

    getOutput(dataSource: ChartDataSource, dataConfig: IChartDataContext) {
        const ctx = {
            dataSource,
            dataConfig,
        };
        this._operators.forEach((operator) => operator(ctx));

        return this._generateOutput(ctx);
    }

    _generateOutput(ctx: IChartDataPipelineContext): IChartData {
        const { dataSource, dataConfig, _headerData: headerData } = ctx;

        const seriesIndexes = dataConfig.seriesIndexes || dataSource.map((_, i) => i).filter((i) => i !== dataConfig.categoryIndex);

        const result: IChartData = {
            series: seriesIndexes.map((index) => {
                const values = dataSource[index];
                return {
                    index,
                    name: toString(headerData?.[index]),
                    items: values.map((value) => ({
                        value,
                        label: toString(value),
                    })),
                };
            }),
        };

        const categoryIndex = dataConfig.categoryIndex;
        if (categoryIndex !== undefined) {
            const categoryData = dataSource[categoryIndex];
            result.category = {
                index: categoryIndex,
                name: toString(headerData?.[categoryIndex]),
                type: dataConfig.categoryType!,
                items: categoryData.map((value) => ({
                    value,
                    label: toString(value),
                })),
                getValueByIndex(index: number) {
                    return this.type === CategoryType.Text ? this.items[index].label : undefined;
                },
            };
        }

        return result;
    }
}

const dataDirectionOperator: IChartDataPipelineOperator = (ctx) => {
    if (ctx.dataConfig.direction === DataDirection.Column) {
        ctx.dataSource = dataDirectionToColumn(ctx.dataSource);
    }
};

const findHeaderOperator: IChartDataPipelineOperator = (ctx) => {
    const header: ChartDataSourceValue[] = [];
    ctx.dataSource.forEach((line) => header.push(line[ctx.dataConfig.headerIndex ?? 0]));
    const counts = countTypesFromArray(header);
    if (counts.strings >= counts.numbers) {
        ctx._headerData = header;
        ctx.dataSource.forEach((items) => items.shift());
    }
};

const findCategoryOperator: IChartDataPipelineOperator = (ctx) => {
    if (ctx.dataConfig.categoryIndex === undefined) {
        const categoryIndex = findCategoryIndex(ctx.dataSource);
        if (categoryIndex >= 0) {
            ctx.dataConfig.categoryIndex = categoryIndex;
        }
    }
    const { dataConfig, dataSource } = ctx;
    if (dataConfig.categoryIndex !== undefined && !dataConfig.categoryType) {
        dataConfig.categoryType = countTypesFromArray(dataSource[dataConfig.categoryIndex]).strings > 0 ? CategoryType.Text : CategoryType.Linear;
    }
};

const aggregateOperator: IChartDataPipelineOperator = (ctx) => {
    const { dataSource, dataConfig } = ctx;

    const categoryData = dataConfig.categoryIndex !== undefined ? dataSource[dataConfig.categoryIndex] : undefined;
    if (categoryData && dataConfig.categoryType === CategoryType.Text) {
        const getCategoryTextByIndex = (idx: number) => toString(categoryData[idx]);
        ctx.dataSource = ctx.dataSource.map((items, itemsIndex) => {
            const groups = groupBy(items, (_, i) => getCategoryTextByIndex(i));
            if (itemsIndex === dataConfig.categoryIndex) {
                return groups.map((group) => group.name);
            } else {
                return groups.map((group) => sumArray(group.values));
            }
        });
    }
};

export const chartDataPipeline = new ChartDataPipeline()
    .pipe(
        dataDirectionOperator,
        findHeaderOperator,
        findCategoryOperator,
        aggregateOperator
    );
