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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    chart: {
        chartType: 'Chart type',
        themes: 'Themes',
        dataRange: 'Data range',
        category: 'Category',
        aggregate: 'Aggregate',
        allSeries: 'All series',
        series: 'Series',
        addSeries: 'Add series',
        moreSettings: 'More settings',
        invalidType: {
            gaps: 'Gaps',
            zero: 'Zero',
            connectDataPointsWithStraightLines: 'Connect data points with straight lines',
        },
        titles: {
            mainTitle: 'Chart title',
            subTitle: 'Chart subtitle',
            xAxisTitle: 'X-axis title',
            yAxisTitle: 'Y-axis title',
        },
        gradientFill: 'Gradient fill',
        settingsLabels: {
            switchToRowOrColumn: 'Switch to row/column',
            useAsCategoryLabels: 'Use {0} as category',
            showEmptyCellsAs: 'Show empty cells as',
        },
        align: {
            left: 'Left',
            center: 'Center',
            right: 'Right',
        },
        chartStyle: 'Chart style',
        chartAndAxisTitles: 'Chart and axis titles',
        legend: 'Legend',
        axes: {
            horizontalAxis: 'Horizontal axis',
            verticalAxis: 'Vertical axis',
            leftAxis: 'Left axis',
            rightAxis: 'Right axis',
        },
        dataLabels: 'Data labels',
        gridlinesAndTicks: 'Gridlines and ticks',
        shape: {
            polygon: 'Polygon',
            circle: 'Circle',
            square: 'Square',
            triangle: 'Triangle',
            diamond: 'Diamond',
        },
        value: 'Value',
        percentage: 'Percentage',
        lineType: {
            line: 'Line',
            smooth: 'Smooth',
            step: 'Step',
        },
        stackType: {
            stack: 'Stack',
            percent: 'Percent stack',
        },
        dashType: {
            solid: 'Solid',
            dash: 'Dash',
            dot: 'Dot',
        },
        none: 'None',
    },
    chartTypes: {
        line: 'Line',
        area: 'Area',
        areaStacked: 'Area stacked',
        areaPercentStacked: 'Area percent stacked',
        column: 'Column',
        bar: 'Bar',
        barStacked: 'Bar stacked',
        barPercentStacked: 'Bar percent stacked',
        pie: 'Pie',
        donut: 'Donut',
        scatter: 'Scatter',
        radar: 'Radar',
        bubble: 'Bubble',
        stock: 'Stock',
        combination: 'Combination',
    },
};

export default locale;
