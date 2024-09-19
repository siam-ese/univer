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

import { CategoryType } from '../constants';
import type { ChartDataSourceValue, ChartDataSourceValues, IChartContext, IChartDataAggregation } from '../types';

export type IChartContextOperator = (dataSource: ChartDataSourceValues, context: IChartContext) => IChartContext;
export type IChartDataAggregateOperator = (dataSource: ChartDataSourceValues, context: IChartContext, dataAggregation: IChartDataAggregation) => ChartDataSourceValues | void;
// export interface IChartDataPipelineContext {
//     context: IChartContext;
//     dataSource: ChartDataSourceValues;
//     dataAggregation: IChartDataAggregation;
// }

type Nil = null | undefined;

export function isNil(value: any): value is Nil {
    return value === null || value === undefined;
}

export function countTypesFromArray(ary: ChartDataSourceValue[]) {
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

export function toString(value: ChartDataSourceValue) {
    return isNil(value)
        ? ''
        : String(value);
}
export function toNumber(value: ChartDataSourceValue) {
    return Number(value) || 0;
}

export function toColumnOrient<T = any>(dataSource: T[][]): T[][] {
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

export function findCategoryIndexes(dataSource: ChartDataSourceValue[][]) {
    const categoryIndexes: number[] = [];

    let categoryIndex = -1;
    let maxCount = 0;

    dataSource.forEach((items, index) => {
        const counts = countTypesFromArray(items);
        if (counts.strings === items.length) {
            categoryIndexes.push(index);
        }
        if (counts.strings > maxCount) {
            maxCount = counts.strings;
            categoryIndex = index;
        }
    });

    if (categoryIndexes.length <= 0 && categoryIndex >= 0) {
        categoryIndexes.push(categoryIndex);
    }

    return categoryIndexes;
}

export function groupBy<T = any>(ary: T[], selector: (item: T, index: number) => string) {
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

export function sumArray(ary: ChartDataSourceValue[]) {
    return ary.reduce((acc: number, item) => acc + toNumber(item), 0);
}

export const findHeaderOperator: IChartContextOperator = (dataSource: ChartDataSourceValues, context: IChartContext) => {
    const header: ChartDataSourceValue[] = dataSource.map((line) => line[0]);

    const newCtx: IChartContext = {};
    const counts = countTypesFromArray(header);
    if (counts.strings >= counts.numbers) {
        newCtx.headers = header.map(toString);
        dataSource.forEach((items, index) => dataSource[index] = items.slice(1));
    } else {
        newCtx.headers = undefined;
    }
    return newCtx;
};

export const findCategoryOperator: IChartContextOperator = (dataSource: ChartDataSourceValues, context: IChartContext) => {
    const categoryIndexes = findCategoryIndexes(dataSource);

    const newCtx: IChartContext = {
        categoryResourceIndexes: categoryIndexes,
    };

    if (isNil(context.categoryIndex)) {
        newCtx.categoryIndex = categoryIndexes[0];
    }

    newCtx.categoryType = isNil(context.categoryIndex)
        ? undefined
        : countTypesFromArray(dataSource[context.categoryIndex]).strings > 0 ? CategoryType.Text : CategoryType.Linear;

    return newCtx;
};

export const findSeriesOperator: IChartContextOperator = (dataSource: ChartDataSourceValues, context: IChartContext) => {
    const seriesResourceIndexesSet = new Set<number>();

    dataSource.forEach((_, i) => {
        if (!context.categoryResourceIndexes?.includes(i)) {
            seriesResourceIndexesSet.add(i);
        }
    });

    const newCtx: IChartContext = {
        seriesResourceIndexes: Array.from(seriesResourceIndexesSet),
    };
    if (isNil(context.seriesIndexes)) {
        newCtx.seriesIndexes = Array.from(seriesResourceIndexesSet);
    }

    return newCtx;
};

export const aggregateOperator: IChartDataAggregateOperator = (dataSource: ChartDataSourceValues, context: IChartContext, dataAggregation: IChartDataAggregation) => {
    const { categoryIndex } = context;
    const { aggregate } = dataAggregation;
    if (!aggregate) {
        return;
    }

    const categoryData = !isNil(categoryIndex) ? dataSource[categoryIndex] : undefined;
    if (!categoryData) {
        return;
    }

    const getCategoryTextByIndex = (idx: number) => toString(categoryData[idx]);

    return dataSource.map((items, itemsIndex) => {
        const groups = groupBy(items, (_, i) => getCategoryTextByIndex(i));
        if (itemsIndex === categoryIndex) {
            return groups.map((group) => group.name);
        } else {
            return groups.map((group) => sumArray(group.values));
        }
    });
};

export const topNOperator: IChartDataAggregateOperator = (dataSource: ChartDataSourceValues, context: IChartContext, dataAggregation: IChartDataAggregation) => {
    const { categoryIndex } = context;
    const { topN } = dataAggregation;
    if (!topN || topN <= 0) {
        return;
    }

    const categoryData = !isNil(categoryIndex) && dataSource[categoryIndex];
    if (!categoryData || categoryData.length < topN) {
        return;
    }

    const topNList = categoryData.map((_, index) => ({
        index,
        value: 0,
    }));

    dataSource.forEach((items) => {
        items.forEach((value, valueIndex) => {
            const topNItem = topNList[valueIndex];
            if (topNItem) {
                topNItem.value += toNumber(value);
            }
        });
    });

    topNList.sort((a, b) => b.value - a.value);

    const topNOrderMap = new Map<number, number>();
    topNList.slice(0, topN).forEach((item, order: number) => {
        topNOrderMap.set(item.index, order);
    });

    return dataSource.map((items) => {
        const newItems: ChartDataSourceValue[] = [];
        let otherValue = 0;
        items.forEach((value, index) => {
            const order = topNOrderMap.get(index);
            if (order !== undefined) {
                newItems[order] = value;
            } else {
                otherValue += toNumber(value);
            }
        });

        newItems.push(otherValue);
        return newItems;
    });
};
