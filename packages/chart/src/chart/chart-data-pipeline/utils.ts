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

import { CategoryType, DataDirection } from '../constants';
import type { ChartDataSourceValue } from '../types';
import type { IChartDataPipelineOperator } from './chart-data-pipeline';

type NestedArray<T = any> = Array<Array<T>>;

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

export function dataDirectionToColumn<T = any>(dataSource: NestedArray<T>): NestedArray<T> {
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

export function findCategoryIndex(dataSource: NestedArray<ChartDataSourceValue>) {
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

export const dataDirectionOperator: IChartDataPipelineOperator = (ctx) => {
    if (ctx.dataConfig.direction === DataDirection.Column) {
        ctx.dataSource = dataDirectionToColumn(ctx.dataSource);
    }
};

export const findHeaderOperator: IChartDataPipelineOperator = (ctx) => {
    const header: ChartDataSourceValue[] = [];
    ctx.dataSource.forEach((line) => header.push(line[ctx.dataConfig.headerIndex ?? 0]));
    const counts = countTypesFromArray(header);
    if (counts.strings >= counts.numbers) {
        ctx._headerData = header;
        ctx.dataSource.forEach((items) => items.shift());
    }
};

export const findCategoryOperator: IChartDataPipelineOperator = (ctx) => {
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

export const aggregateOperator: IChartDataPipelineOperator = (ctx) => {
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
