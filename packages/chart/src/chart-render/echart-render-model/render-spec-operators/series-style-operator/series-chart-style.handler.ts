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

import { Tools } from '@univerjs/core';

import tinyColor from 'tinycolor2';
import { chartBitsUtils, ChartTypeBits } from '../../../../chart/constants';
import { themeColors } from '../../../../chart/constants/default-chart-style';
import { LinePointShape } from '../../../../chart/style.types';
import type { ISeriesStyleHandlerContext, SeriesItemHandler } from './series-style-operator';

const getGradientColor = (color: string) => {
    return {
        gradient: 'linear',
        x0: 0.5,
        y0: 1,
        x1: 0.5,
        y1: 0.3,
        colorStops: [
            {
                offset: 0,
                color: tinyColor(color).setAlpha(0.2).toRgbString(),
            },
            {
                offset: 1,
                color,
            },
        ],
    };
};

const shapeMap = {
    [LinePointShape.Circle]: 'emptyCircle',
    [LinePointShape.Square]: 'rect',
    [LinePointShape.Triangle]: 'triangle',
    [LinePointShape.Diamond]: 'diamond',
};

const seriesStylizers = {
    bar(ctx: ISeriesStyleHandlerContext, seriesColor: string) {
        const { chartStyle, seriesItem, seriesStyle } = ctx;
        const dataPoints = seriesStyle?.dataPoints;

        const fillColor = seriesStyle?.color ?? seriesColor;
        const gradientFill = chartStyle.gradientFill;

        if (dataPoints) {
            Tools.set(seriesItem, 'itemStyle.color', (params: any) => {
                const pointStyle = dataPoints[params.dataIndex];
                if (pointStyle?.color) {
                    return pointStyle.color;
                } else {
                    return gradientFill ? getGradientColor(fillColor) : fillColor;
                }
            });
        } else {
            Tools.set(seriesItem, 'itemStyle.color', gradientFill ? getGradientColor(fillColor) : fillColor);
        }

        if (seriesStyle?.fillOpacity) {
            Tools.set(seriesItem, 'itemStyle.opacity', seriesStyle.fillOpacity);
        }
        const borderStyle = seriesStyle?.border;
        if (borderStyle?.dashType) {
            Tools.set(seriesItem, 'itemStyle.borderType', borderStyle.dashType);
        }
        if (borderStyle?.width !== undefined) {
            Tools.set(seriesItem, 'itemStyle.borderWith', borderStyle.width);
        }

        if (borderStyle?.color) {
            const borderColor = borderStyle?.opacity ? tinyColor(borderStyle.color).setAlpha(borderStyle.opacity).toRgbString() : borderStyle.color;
            Tools.set(seriesItem, 'bar.style.outerBorder.stroke', borderColor);
        }
    },
    // eslint-disable-next-line complexity
    line(ctx: ISeriesStyleHandlerContext, seriesColor: string) {
        const { chartType, chartStyle, seriesStyle, seriesItem } = ctx;
        const dataPoints = seriesStyle?.dataPoints;

        const isArea = chartBitsUtils.baseOn(chartType, ChartTypeBits.Area);
        const gradientFill = chartStyle.gradientFill ?? isArea;
        if (isArea) {
            const fillColor = seriesStyle?.color ?? seriesColor;
            Tools.set(seriesItem, 'areaStyle.color', gradientFill ? getGradientColor(fillColor) : fillColor);

            if (seriesStyle?.fillOpacity) {
                Tools.set(seriesItem, 'areaStyle.opacity', seriesStyle.fillOpacity);
            }
        }
        const { border, point } = seriesStyle || {};
        if (point?.shape) {
            Tools.set(seriesItem, 'symbol', shapeMap[point.shape]);
        }

        if (border?.color) {
            Tools.set(seriesItem, 'lineStyle.color', border.color);
        }

        if (border?.opacity) {
            Tools.set(seriesItem, 'lineStyle.opacity', border.opacity);
        }
        if (border?.width !== undefined) {
            Tools.set(seriesItem, 'lineStyle.width', border.width);
        }
        if (border?.dashType) {
            Tools.set(seriesItem, 'lineStyle.type', border.dashType);
        }

        if (dataPoints) {
            Tools.set(seriesItem, 'symbol', (value: any, params: any) => {
                const pointStyle = dataPoints[params.dataIndex];
                if (pointStyle?.shape) {
                    return shapeMap[pointStyle.shape];
                }
                if (point?.shape) {
                    return shapeMap[point.shape];
                }
            });
            Tools.set(seriesItem, 'symbolSize', (value: any, params: any) => {
                const pointStyle = dataPoints[params.dataIndex];
                if (pointStyle?.size !== undefined) {
                    return pointStyle.size;
                }
                if (point?.size !== undefined) {
                    return point.size;
                }
                return 0;
            });
            Tools.set(seriesItem, 'itemStyle.color', (params: any) => {
                const pointStyle = dataPoints[params.dataIndex];
                if (pointStyle?.color) {
                    return pointStyle.color;
                }
                if (point?.color) {
                    return point.color;
                }
            });
        } else {
            if (point?.shape) {
                Tools.set(seriesItem, 'symbol', shapeMap[point.shape]);
            }
            if (point?.color) {
                Tools.set(seriesItem, 'itemStyle.color', point?.color);
            }
            Tools.set(seriesItem, 'symbolSize', point?.size !== undefined ? point.size : 0);
        }
    },
};
export const seriesChartStyleHandler: SeriesItemHandler = (ctx) => {
    const { seriesItem } = ctx;

    const color = themeColors[ctx.seriesIndex % themeColors.length];

    const stylizer = seriesStylizers[seriesItem.type as 'bar' | 'line'];
    stylizer?.(ctx, color);
};
