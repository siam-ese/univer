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

import { generateRandomId } from '@univerjs/core';
import { AreaLineStyle, ChartBorderDashType, InvalidValueType, LabelContentType, LegendPosition, LinePointShape, PieLabelPosition, RadarShape, SeriesLabelPosition } from '../style.types';
import { ChartTypeBits } from '../constants';

export const themeColors = [
    '#1F77B4', // # Blue
    '#FF7F0E', // # Orange
    '#2CA02C', // # Green
    '#D62728', // # Red
    '#9467BD', // # Purple
    '#8C564B', // # Brown
    '#E377C2', // # Pink
    '#7F7F7F', // # Gray
    '#BCBD22', // # Olive
    '#17BECF', // # Teal
    '#AEC7E8', // # Light Blue
    '#FFBB78', // # Light Orange
    '#98DF8A', // # Light Green
    '#FF9896', // # Light Red
    '#C5B0D5', // # Light Purple
    '#C49C94', // # Light Brown
    '#F7B6D2', // # Light Pink
    '#C7C7C7', // # Light Gray
    '#DBDB8D', // # Light Olive
    '#9EDAE5', // # Light Teal
];

export const defaultChartStyle = {
    allSeriesId: generateRandomId(10),
    invalidValueType: InvalidValueType.Break,
    linePoint: {
        shape: LinePointShape.Circle,
        size: 4,
    },
    axis: {
        lineVisible: true,
        labelVisible: true,
        reverse: false,
        gridLineVisible: true,
    },
    legend: {
        position: LegendPosition.Bottom,
    },
    borderStyle: {
        opacity: 1,
        width: 0,
        dashType: ChartBorderDashType.Solid,
    },
    textStyle: {
        fontSize: 12,
        titleFontSize: 16,
        color: '#1f2329',
        align: 'left',
        position: SeriesLabelPosition.Auto,
    },
    area: {
        lineStyle: AreaLineStyle.Line,
    },
    pie: {
        labelContentType: LabelContentType.CategoryName | LabelContentType.Value | LabelContentType.Percentage,
        radius: 0.8,
        doughnutHole: 0.73,
        borderColor: '#fff',
        labelPosition: PieLabelPosition.Outside,
    },
    combination: {
        firstChartType: ChartTypeBits.Column,
        otherChartType: ChartTypeBits.Line,
    },
    radar: {
        shape: RadarShape.Polygon,
    },
};
