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

import { AreaLineStyle, ChartBorderDashType, ChartTypeBits, defaultChartStyle, InvalidValueType, LabelContentType, LegendPosition, LinePointShape, PieLabelPosition, RadarShape, SeriesLabelPosition, StackType } from '@univerjs/chart';
import type { IChartOptionType } from '../services/sheets-chart-ui.service';

export type OptionType = IChartOptionType;

export const defaultOption = {
    label: 'chart.default',
    value: '__default__',
};

export const chartTypeOptions = [
    {
        label: 'chartTypes.line',
        value: ChartTypeBits.Line,
    },
    {
        label: 'chartTypes.column',
        value: ChartTypeBits.Column,
    },
    {
        label: 'chartTypes.bar',
        value: ChartTypeBits.Bar,
    },
    {
        label: 'chartTypes.barStacked',
        value: ChartTypeBits.BarStacked,
    },
    {
        label: 'chartTypes.barPercentStacked',
        value: ChartTypeBits.BarPercentStacked,
    },
    {
        label: 'chartTypes.pie',
        value: ChartTypeBits.Pie,
    },
    {
        label: 'chartTypes.donut',
        value: ChartTypeBits.Doughnut,
    },
    {
        label: 'chartTypes.area',
        value: ChartTypeBits.Area,
    },
    {
        label: 'chartTypes.areaStacked',
        value: ChartTypeBits.AreaStacked,
    },
    {
        label: 'chartTypes.areaPercentStacked',
        value: ChartTypeBits.AreaPercentStacked,
    },
    {
        label: 'chartTypes.radar',
        value: ChartTypeBits.Radar,
    },
    {
        label: 'chartTypes.combination',
        value: ChartTypeBits.Combination,
    },
].map((option) => ({ ...option, value: String(option.value) }));

export const seriesChartTypeOptions = chartTypeOptions.filter((option) => {
    const seriesChartTypes = [
        ChartTypeBits.Line,
        ChartTypeBits.Column,
        ChartTypeBits.Area,
    ].map((type) => String(type));

    return seriesChartTypes.includes(option.value);
});

export const titleOptions = [
    {
        label: 'chart.titles.mainTitle',
        value: 'title',
    },
    {
        label: 'chart.titles.subTitle',
        value: 'subtitle',
    },
    {
        label: 'chart.titles.xAxisTitle',
        value: 'xAxisTitle',
    },
    {
        label: 'chart.titles.yAxisTitle',
        value: 'yAxisTitle',
    },
    {
        label: 'chart.titles.rightAxisTitle',
        value: 'rightYAxisTitle',
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
        label: 'chart.align.left',
        value: 'left',
    },
    {
        label: 'chart.align.center',
        value: 'center',
    },
    {
        label: 'chart.align.right',
        value: 'right',
    },
] as const;

export type TextAlignOptionValue = typeof textAlignOptions[number]['value'];

export function getAllSeriesOption() {
    return {
        label: 'chart.allSeries',
        value: defaultChartStyle.allSeriesId,
    };
}

export const lineOpacityOptions = [1, 0.9, 0.7, 0.5, 0.3, 0.1, 0].map((opacity) => ({
    label: `${opacity * 100}%`,
    value: String(opacity),
}));

export const axisPositionOptions = [
    {
        label: 'chart.axes.leftAxis',
        value: 'left',
    },
    {
        label: 'chart.axes.rightAxis',
        value: 'right',
    },
];

export const borderDashTypeOptions = [
    {
        label: 'chart.dashType.solid',
        value: ChartBorderDashType.Solid,
    },
    {
        label: 'chart.dashType.dash',
        value: ChartBorderDashType.Dashed,
    },
    {
        label: 'chart.dashType.dot',
        value: ChartBorderDashType.Dotted,
    },
];

export const linePointShapeOptions = [
    {
        label: 'chart.shape.circle',
        value: LinePointShape.Circle,
    },
    {
        label: 'chart.shape.square',
        value: LinePointShape.Square,
    },
    {
        label: 'chart.shape.triangle',
        value: LinePointShape.Triangle,
    },
    {
        label: 'chart.shape.diamond',
        value: LinePointShape.Diamond,
    },
];

export const linePointSizeOptions = [0, 2, 5, 7, 10, 14].map((size) => ({
    label: `${size}px`,
    value: String(size),
}));

export const borderWidthOptions = [0, 1, 2, 4, 8].map((width) => ({
    label: `${width}px`,
    value: String(width),
}));

export const dataLabelPositionOptions = [
    SeriesLabelPosition.Auto,
    SeriesLabelPosition.Inside,
    SeriesLabelPosition.Left,
    SeriesLabelPosition.Top,
    SeriesLabelPosition.Bottom,
].map((value) => ({
    label: `chart.positionType.${value}`,
    value,
}));

export const pieDataLabelPositionOptions = [
    PieLabelPosition.Inside,
    PieLabelPosition.Outside,
].map((value) => ({
    label: `chart.positionType.${value}`,
    value,
}));

export const legendLabelPositionOptions = [LegendPosition.Top, LegendPosition.Bottom, LegendPosition.Left, LegendPosition.Right, LegendPosition.Hide].map((value) => ({
    label: `chart.positionType.${value}`,
    value,
}));

export const axisListOptions = [
    { value: 'xAxis', label: 'chart.axes.horizontalAxis' },
    { value: 'yAxis', label: 'chart.axes.verticalAxis' },
    { value: 'rightYAxis', label: 'chart.axes.rightAxis' },
];

export const tickThicknessOptions = [1, 2, 3].map((value) => ({
    label: `${value}px`,
    value: String(value),
}));

export const stackTypeOptions: OptionType[] = [
    {
        label: 'chart.none',
        value: '',
    },
    {
        label: 'chart.stackType.stacked',
        value: StackType.Stacked,
    },
    {
        label: 'chart.stackType.percentStacked',
        value: StackType.Percent,
    },
];

export const areaLineTypeOptions = [
    {
        label: 'chart.lineType.line',
        value: AreaLineStyle.Line,
    },
    {
        label: 'chart.lineType.smooth',
        value: AreaLineStyle.Smooth,
    },
    {
        label: 'chart.lineType.step',
        value: AreaLineStyle.Step,
    },
];

export const pieDonutHoleOptions = [0, 0.25, 0.5, 0.75].map((value) => ({
    label: `${value * 100}%`,
    value: String(value),
}));

export const radarShapeOptions = [
    {
        label: 'chart.shape.polygon',
        value: RadarShape.Polygon,
    },
    {
        label: 'chart.shape.circle',
        value: RadarShape.Circle,
    },
];

export const invalidValueOptions = [
    {
        label: 'chart.invalidType.gaps',
        value: InvalidValueType.Break,
    },
    {
        label: 'chart.invalidType.zero',
        value: InvalidValueType.Zero,
    },
    {
        label: 'chart.invalidType.connectDataPointsWithStraightLines',
        value: InvalidValueType.Link,
    },
];

export const labelContentTypeList = [
    LabelContentType.CategoryName,
    LabelContentType.SeriesName,
    LabelContentType.Value,
    LabelContentType.Percentage,
];

export const labelContentOptions = [
    {
        label: 'chart.category',
        value: LabelContentType.CategoryName,
    },
    {
        label: 'chart.series',
        value: LabelContentType.SeriesName,
    },
    {
        label: 'chart.value',
        value: LabelContentType.Value,
    },
    {
        label: 'chart.percentage',
        value: LabelContentType.Percentage,
    },
].map((option) => ({ ...option, value: String(option.value) }));

// export const lineLabelContentOptions = labelContentOptions.filter((option) => option.value !== String(LabelContentType.Percentage));
export const pieLabelContentOptions = labelContentOptions.filter((option) => option.value !== String(LabelContentType.SeriesName));
export const tickLengthOptions = [6, 12, 18, 24].map((value) => ({
    label: `${value}px`,
    value: String(value),
}));
export const tickWidthOptions = [1, 2, 4, 8].map((value) => ({
    label: `${value}px`,
    value: String(value),
}));
