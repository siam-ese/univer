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

import React from 'react';

import type { ChartBorderDashType, DeepPartial, ISeriesStyle, LinePointShape } from '@univerjs/chart';
import { ChartCartesianAxisPosition, defaultChartStyle } from '@univerjs/chart';
import { Select } from '@univerjs/design';

import type { LocaleService, Nullable } from '@univerjs/core';
import {
    axisPositionOptions,
    borderDashTypeOptions,
    borderWidthOptions,
    // lineLabelContentOptions,
    lineOpacityOptions,
    linePointShapeOptions,
    linePointSizeOptions,
} from '../options';
import { ColorPickerControl } from '../color-picker-control';
import { useTranslatedOptions } from '../use-translated-options';

export interface IWidgetProps {
    localeService: LocaleService;
    onSeriesStyleChange?: (style: DeepPartial<ISeriesStyle>) => void;
}

export interface IFillOptions extends IWidgetProps {
    seriesStyle: Nullable<DeepPartial<ISeriesStyle>>;
}

export const FillOptions = (props: IFillOptions) => {
    const { localeService, seriesStyle, onSeriesStyleChange } = props;
    const { t } = localeService;
    return (
        <>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withColor', t('chart.fill'))}</div>
                <ColorPickerControl color={seriesStyle?.color ?? ''} onChange={(color) => onSeriesStyleChange?.({ color })}></ColorPickerControl>
            </div>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withOpacity', t('chart.fill'))}</div>
                <Select value={String(seriesStyle?.fillOpacity ?? String(defaultChartStyle.borderStyle.opacity))} options={lineOpacityOptions} onChange={(v) => onSeriesStyleChange?.({ fillOpacity: Number(v) })}></Select>
            </div>
        </>
    );
};

export interface IBorderOptionsProps extends IWidgetProps {
    borderStyle: ISeriesStyle['border'];
    controlName: string;
}

export const BorderOptions = (props: IBorderOptionsProps) => {
    const { localeService, borderStyle, onSeriesStyleChange, controlName } = props;

    const innerBorderDashTypeOptions = useTranslatedOptions(localeService, borderDashTypeOptions);
    const { t } = localeService;
    return (
        <>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withColor', controlName)}</div>
                <ColorPickerControl color={borderStyle?.color} onChange={(color) => onSeriesStyleChange?.({ border: { color } })}></ColorPickerControl>
            </div>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withOpacity', controlName)}</div>
                <Select value={String(borderStyle?.opacity)} options={lineOpacityOptions} onChange={(v) => onSeriesStyleChange?.({ border: { opacity: Number(v) } })}></Select>
            </div>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withType', controlName)}</div>
                <Select value={borderStyle?.dashType} options={innerBorderDashTypeOptions} onChange={(v) => onSeriesStyleChange?.({ border: { dashType: v as ChartBorderDashType } })}></Select>
            </div>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withThickness', controlName)}</div>
                <Select value={String(borderStyle?.width)} options={borderWidthOptions} onChange={(v) => onSeriesStyleChange?.({ border: { width: Number(v) } })}></Select>
            </div>
        </>
    );
};

export interface ILinePointOptionsProps extends IWidgetProps {
    pointStyle: ISeriesStyle['point'];
}

export const LinePointOptions = (props: ILinePointOptionsProps) => {
    const { localeService, pointStyle, onSeriesStyleChange } = props;
    const innerLinePointShapeOptions = useTranslatedOptions(localeService, linePointShapeOptions);
    const innerLinePointSizeOptions = useTranslatedOptions(localeService, linePointSizeOptions);
    const { t } = localeService;
    return (
        <>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withShape', t('chart.point'))}</div>
                <Select value={String(pointStyle.shape)} options={innerLinePointShapeOptions} onChange={(v) => onSeriesStyleChange?.({ point: { shape: v as LinePointShape } })}></Select>
            </div>
            <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withSize', t('chart.dataPoint'))}</div>
                <Select value={String(pointStyle.size)} options={innerLinePointSizeOptions} onChange={(v) => onSeriesStyleChange?.({ point: { size: Number(v) } })}></Select>
            </div>
            {/* <div className="chart-edit-panel-row-half">
                <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.withColor', t('chart.dataPoint'))}</div>
                <ColorPickerControl color={pointStyle.color} onChange={(color) => onSeriesStyleChange?.({ point: { color } })}></ColorPickerControl>
            </div> */}
        </>
    );
};

export interface IAxisControlProps extends IWidgetProps {
    rightYAxis: boolean;

}

export const AxisControl = (props: IAxisControlProps) => {
    const { localeService, rightYAxis, onSeriesStyleChange } = props;
    const innerAxisPositionOptions = useTranslatedOptions(localeService, axisPositionOptions);
    const { t } = localeService;
    return (
        <div className="chart-edit-panel-row-half">
            <div className="chart-edit-panel-label chart-edit-panel-top-gap">{t('chart.axes.axis')}</div>
            <Select value={rightYAxis ? ChartCartesianAxisPosition.Right : ChartCartesianAxisPosition.Left} options={innerAxisPositionOptions} onChange={(v) => onSeriesStyleChange?.({ rightYAxis: v === ChartCartesianAxisPosition.Right })}></Select>
        </div>
    );
};
