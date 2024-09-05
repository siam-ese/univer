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

import { AreaLineStyle, ChartBorderDashType, ChartTypeBits, defaultChartStyle, LabelContentType, LegendPosition, PieLabelPosition, RadarShape, SeriesLabelPosition, StackType } from '@univerjs/chart';
import type { IChartOptionType } from '../services/sheets-chart-ui.service';

export type OptionType = IChartOptionType;

export const chartTypeOptions = [
    {
        label: '折线图',
        value: ChartTypeBits.Line,
    },
    {
        label: '柱状图',
        value: ChartTypeBits.Column,
    },

    {
        label: '条形图',
        value: ChartTypeBits.Bar,
    },
    {
        label: '堆叠条形图',
        value: ChartTypeBits.BarStacked,
    },
    {
        label: '百分比堆叠条形图',
        value: ChartTypeBits.BarPercentStacked,
    },
    {
        label: '饼图',
        value: ChartTypeBits.Pie,
    },
    {
        label: '环形图',
        value: ChartTypeBits.Doughnut,
    },
    {
        label: '面积图',
        value: ChartTypeBits.Area,
    },
    {
        label: '堆叠面积图',
        value: ChartTypeBits.AreaStacked,
    },
    {
        label: '百分比堆叠面积图',
        value: ChartTypeBits.AreaPercentStacked,
    },
    {
        label: '雷达图',
        value: ChartTypeBits.Radar,
    },
    {
        label: '组合图',
        value: ChartTypeBits.Combination,
    },
].map((option) => ({ ...option, value: String(option.value) }));

export const seriesChartTypeOptions = chartTypeOptions.filter((option) => {
    const seriesChartTypes = [
        ChartTypeBits.Line,
        ChartTypeBits.Bar,
        // ChartTypeBits.BarStacked,
        // ChartTypeBits.BarPercentStacked,
        ChartTypeBits.Area,
        // ChartTypeBits.AreaStacked,
        // ChartTypeBits.AreaPercentStacked,
    ].map((type) => String(type));

    return seriesChartTypes.includes(option.value);
});

export const titleOptions = [
    {
        label: '图表标题',
        value: 'titleStyle',
    },
    {
        label: '图表副标题',
        value: 'subtitleStyle',
    },
    {
        label: 'X轴标题',
        value: 'xAxisTitleStyle',
    },
    {
        label: 'Y轴标题',
        value: 'yAxisTitleStyle',
    },
] as const;

export type TitleOptionValue = typeof titleOptions[number]['value'];

export const fontSizeOptions = [
    {
        label: '10',
        value: '10',
    },
    {
        label: '12',
        value: '12',
    },
    {
        label: '14',
        value: '14',
    },
    {
        label: '16',
        value: '16',
    },
    {
        label: '18',
        value: '18',
    },
    {
        label: '20',
        value: '20',
    },
    {
        label: '24',
        value: '24',
    },
    {
        label: '30',
        value: '30',
    },
    {
        label: '36',
        value: '36',
    },
] as const;

export const textAlignOptions = [
    {
        label: '左对齐',
        value: 'left',
    },
    {
        label: '居中',
        value: 'center',
    },
    {
        label: '右对齐',
        value: 'right',
    },
] as const;

export type TextAlignOptionValue = typeof textAlignOptions[number]['value'];

export function getAllSeriesOption() {
    return {
        label: '全部系列',
        value: defaultChartStyle.allSeriesId,
    };
}

export const lineOpacityOptions = [1, 0.9, 0.7, 0.5, 0.3, 0.1, 0].map((opacity) => ({
    label: `${opacity * 100}%`,
    value: String(opacity),
}));

export const borderDashTypeOptions = [
    {
        label: '实线',
        value: ChartBorderDashType.Solid,
    },
    {
        label: '虚线',
        value: ChartBorderDashType.Dashed,
    },
    {
        label: '点线',
        value: ChartBorderDashType.Dotted,
    },
];

export const borderWidthOptions = [0, 1, 2, 4, 8].map((width) => ({
    label: `${width}px`,
    value: String(width),
}));

export const dataLabelPositionOptions = [
    SeriesLabelPosition.Auto,
    SeriesLabelPosition.Outside,
    SeriesLabelPosition.Center,
    SeriesLabelPosition.Top,
    SeriesLabelPosition.Bottom,
].map((value) => ({
    label: value,
    value,
}));

export const pieDataLabelPositionOptions = [
    PieLabelPosition.Inside,
    PieLabelPosition.Outside,
].map((value) => ({
    label: value,
    value,
}));

export const legendLabelPositionOptions = [LegendPosition.Top, LegendPosition.Bottom, LegendPosition.Left, LegendPosition.Right, LegendPosition.Hide].map((value) => ({
    label: value,
    value,
}));

export const axisListOptions = [
    { value: 'xAxis', label: 'Horizontal axis' },
    { value: 'yAxis', label: 'Vertical axis' },
];

export const tickThicknessOptions = [1, 2, 3].map((value) => ({
    label: `${value}px`,
    value: String(value),
}));

export const stackTypeOptions: OptionType[] = [
    {
        label: 'None',
        value: '',
    },
    {
        label: 'Stacked',
        value: StackType.Stacked,
    },
    {
        label: 'Percent',
        value: StackType.Percent,
    },
];

export const areaLineTypeOptions = [
    {
        label: 'Line',
        value: AreaLineStyle.Line,
    },
    {
        label: 'Smooth',
        value: AreaLineStyle.Smooth,
    },
    {
        label: 'Step',
        value: AreaLineStyle.Step,
    },
];

export const pieDonutHoleOptions = [0, 0.25, 0.5, 0.75].map((value) => ({
    label: `${value * 100}%`,
    value: String(value),
}));

export const pieLabelContentOptions = [
    {
        label: 'Category',
        value: LabelContentType.CategoryName,
    },
    {
        label: 'Value',
        value: LabelContentType.Value,
    },
    {
        label: 'Percentage',
        value: LabelContentType.Percentage,
    },
].map((option) => ({ ...option, value: String(option.value) }));

export const radarShapeOptions = [
    {
        label: 'Polygon',
        value: RadarShape.Polygon,
    },
    {
        label: 'Circle',
        value: RadarShape.Circle,
    },
];

