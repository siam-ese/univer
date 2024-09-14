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

const locale = {
    chart: {
        default: '默认',
        chartType: '图表类型',
        themes: '主题色',
        dataRange: '数据范围',
        category: '类别',
        aggregate: '聚合',
        allSeries: '所有系列',
        series: '系列',
        addSeries: '添加系列',
        moreSettings: '更多设置',
        min: '最小值',
        max: '最大值',
        invalidType: {
            gaps: '空',
            zero: '零',
            connectDataPointsWithStraightLines: '用直线连接数据点',
        },
        backgroundColor: '背景颜色',
        chartBorderColor: '图表边框颜色',
        titles: {
            mainTitle: '图表标题',
            subTitle: '副标题',
            xAxisTitle: '横轴标题',
            yAxisTitle: '纵轴标题',
            // leftAxisTitle: '左轴标题',
            rightYAxisTitle: '右纵轴标题',
            titleFormat: '标题格式',
            titleText: '标题文本',
        },
        gradientFill: '渐变填充',
        settingsLabels: {
            switchToRowOrColumn: '切换行列',
            useAsCategoryLabels: '将 {0} 作为类别',
            showEmptyCellsAs: '空单元格显示为',
        },
        positionType: {
            auto: '自动',
            inside: '内部',
            outside: '外部',
            top: '顶部',
            bottom: '底部',
            left: '左侧',
            right: '右侧',
            hide: '隐藏',
        },
        align: {
            left: '左对齐',
            center: '居中',
            right: '右对齐',
        },
        chartStyle: '图表样式',
        chartAndAxisTitles: '图表和轴标题',
        legend: '图例',
        axes: {
            axis: '轴',
            axisOptions: '轴选项',
            horizontalAxis: '横轴',
            verticalAxis: '纵轴',
            rightVerticalAxis: '右纵轴',
        },
        position: '位置',
        dataLabels: '数据标签',
        gridlinesAndTicks: '网格线和刻度线',
        shape: {
            polygon: '多边形',
            circle: '圆形',
            square: '正方形',
            triangle: '三角形',
            diamond: '菱形',
        },
        border: '边框',
        value: '值',
        fill: '填充',
        line: '线条',
        withOpacity: '{0}透明度',
        withColor: '{0}颜色',
        withThickness: '{0}粗细',
        withType: '{0}类型',
        withSize: '{0}大小',
        withShape: '{0}形状',
        withFormat: '{0}格式',
        dataPoint: '数据点',
        addDataPoint: '添加数据点',
        point: '数据点',
        percentage: '百分比',
        lineType: {
            line: '折线',
            smooth: '平滑',
            step: '阶梯',
        },
        stackType: {
            stack: '堆叠',
            percent: '百分比堆叠',
        },
        lineDashType: '线类型',
        dashType: {
            solid: '实线',
            dash: '虚线',
            dot: '点线',
        },
        color: '颜色',
        gridlines: {

            majorGridlines: '主网格线',
            text: '网格线',
        },
        ticks: {
            majorTick: '主刻度线',
            tickPosition: '刻度线位置',
            tickLength: '刻度线长度',

        },
        none: '无',
        styleEditPanel: {
            showLabels: '显示标签',
            showDataLabels: '显示数据标签',
            reverseAxisOrder: '逆序横轴',
            showAxisLine: '显示轴线',
            labelPosition: '标签位置',
            labelText: '标签文本',

        },
    },
    chartTypes: {
        line: '折线图',
        area: '面积图',
        areaStacked: '堆叠面积图',
        areaPercentStacked: '百分比堆叠面积图',
        column: '柱状图',
        bar: '条形图',
        barStacked: '堆叠条形图',
        barPercentStacked: '百分比堆叠条形图',
        pie: '饼图',
        donut: '环形图',
        scatter: '散点图',
        radar: '雷达图',
        bubble: '气泡图',
        stock: '股票图',
        combination: '组合图',
    },
};

export default locale;
