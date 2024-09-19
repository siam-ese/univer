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

export enum ChartAttributeBits {
    Stack = 1 << 30,
    PercentStack = 1 << 29 | ChartAttributeBits.Stack,
    Horizontal = 1 << 28,
}

export enum ChartTypeBits {
    None = 0,
    /** Line chart */
    Line = 1 << 1,
    /** Bar chart */
    Column = 1 << 2,
    ColumnStacked = ChartTypeBits.Column | ChartAttributeBits.Stack,
    ColumnPercentStacked = ChartTypeBits.Column | ChartAttributeBits.PercentStack,

    Bar = 1 << 2 | ChartAttributeBits.Horizontal,
    BarStacked = ChartTypeBits.Bar | ChartAttributeBits.Stack,
    BarPercentStacked = ChartTypeBits.Bar | ChartAttributeBits.PercentStack,
    /** Pie chart */
    Pie = 1 << 3,
    Doughnut = 1 << 8 | ChartTypeBits.Pie,
    /** Area chart */
    Area = 1 << 4,
    AreaStacked = ChartTypeBits.Area | ChartAttributeBits.Stack,
    AreaPercentStacked = ChartTypeBits.Area | ChartAttributeBits.PercentStack,
    /** Radar chart */
    Radar = 1 << 5,
    /** Scatter chart */
    Scatter = 1 << 6,
    /** Combination chart */
    Combination = 1 << 7,
}

const chartTypeStrings = {
    [ChartTypeBits.None]: '',
    [ChartTypeBits.Line]: 'line',
    [ChartTypeBits.Column]: 'bar',
    [ChartTypeBits.ColumnStacked]: 'bar',
    [ChartTypeBits.ColumnPercentStacked]: 'bar',
    [ChartTypeBits.Bar]: 'bar',
    [ChartTypeBits.BarStacked]: 'bar',
    [ChartTypeBits.BarPercentStacked]: 'bar',
    [ChartTypeBits.Pie]: 'pie',
    [ChartTypeBits.Area]: 'line',
    [ChartTypeBits.AreaStacked]: 'line',
    [ChartTypeBits.AreaPercentStacked]: 'line',
    [ChartTypeBits.Radar]: 'radar',
    [ChartTypeBits.Scatter]: 'scatter',
    [ChartTypeBits.Combination]: 'combination',
    [ChartTypeBits.Doughnut]: 'pie',
} as const;

export const chartBitsUtils = {
    has(bit: number, attribute: number) {
        return (bit & attribute) === attribute;
    },
    baseOn(bit: number, base: number) {
        return (bit & base) !== 0 && bit >= base;
    },
    remove(bit: number, attribute: number) {
        return bit & ~attribute;
    },
    chartBitToString(bit: ChartTypeBits) {
        return chartTypeStrings[bit];
    },
};

export enum DataOrientation {
    Row = 'Row',
    Column = 'Column',
}

export enum CategoryType {
    Linear = 'Linear',
    Text = 'Text',
}
