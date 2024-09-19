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
        chartType: '圖表類型',
        themes: '主題色',
        dataRange: '數據範圍',
        category: '類別',
        aggregate: '聚合',
        allSeries: '所有系列',
        series: '系列',
        addSeries: '添加系列',
        moreSettings: '更多設置',
        invalidType: {
            gaps: '空',
            zero: '零',
            connectDataPointsWithStraightLines: '用直線連接數據點',
        },
        titles: {
            mainTitle: '圖表標題',
            subTitle: '副標題',
            xAxisTitle: 'X軸標題',
            yAxisTitle: 'Y軸標題',
        },
        gradientFill: '漸變填充',
        settingsLabels: {
            switchToRowOrColumn: '切換行列',
            useAsCategoryLabels: '將 {0} 作為類別',
            showEmptyCellsAs: '空單元格顯示為',
        },
        align: {
            left: '左對齊',
            center: '居中',
            right: '右對齊',
        },
        chartStyle: '圖表樣式',
        chartAndAxisTitles: '圖表和軸標題',
        legend: '圖例',
        axes: {
            horizontalAxis: '水平軸',
            verticalAxis: '垂直軸',
            leftAxis: '左軸',
            rightAxis: '右軸',
        },
        dataLabels: '數據標籤',
        gridlinesAndTicks: '網格線和刻度線',
        shape: {
            polygon: '多邊形',
            circle: '圓形',
            square: '正方形',
            triangle: '三角形',
            diamond: '菱形',
        },
        value: '值',
        percentage: '百分比',
        lineType: {
            line: '折線',
            smooth: '平滑',
            step: '階梯',
        },
        stackType: {
            stack: '堆疊',
            percent: '百分比堆疊',
        },
        dashType: {
            solid: '實線',
            dash: '虛線',
            dot: '點線',
        },
        none: '無',
    },
    chartTypes: {
        line: '折線圖',
        area: '面積圖',
        areaStacked: '堆疊面積圖',
        areaPercentStacked: '百分比堆疊面積圖',
        column: '柱狀圖',
        bar: '條形圖',
        barStacked: '堆疊條形圖',
        barPercentStacked: '百分比堆疊條形圖',
        pie: '餅圖',
        donut: '環形圖',
        scatter: '散點圖',
        radar: '雷達圖',
        bubble: '氣泡圖',
        stock: '股票圖',
        combination: '組合圖',
    },
};

export default locale;
