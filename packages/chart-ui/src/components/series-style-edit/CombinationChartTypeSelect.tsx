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

import React, { useCallback } from 'react';

import type { DeepPartial, ISeriesStyle } from '@univerjs/chart';
import { ChartTypeBits, defaultChartStyle } from '@univerjs/chart';
import { Select } from '@univerjs/design';

import type { LocaleService } from '@univerjs/core';
import type { SheetsChartUIService } from '../../services/sheets-chart-ui.service';
import { useChartConfigState } from '../../hooks';
import {
    seriesChartTypeOptions,
} from '../options';
import { useTranslatedOptions } from '../use-translated-options';
import { useSeriesChartType } from './use-series-chart-type';

export interface ICombinationChartTypeSelectProps {
    localeService: LocaleService;
    service: SheetsChartUIService;
    seriesId: string;
}

export const CombinationChartTypeSelect = (props: ICombinationChartTypeSelectProps) => {
    const { seriesId, service, localeService } = props;
    const innerSeriesChartTypeOptions = useTranslatedOptions(localeService, seriesChartTypeOptions);
    const isAllSeriesStyle = seriesId === defaultChartStyle.allSeriesId;

    const [seriesStyleMap, setSeriesStyleMap] = useChartConfigState('seriesStyleMap', service);
    const [seriesValues] = useChartConfigState('seriesValues', service);

    const setSeriesChartType = useCallback((v: string) => {
        const chartTypeBit = Number(v) as ChartTypeBits.Area | ChartTypeBits.Column | ChartTypeBits.Line;
        if (isAllSeriesStyle) {
            const styleMap = seriesValues?.reduce((acc, id) => {
                acc[String(id)] = {
                    chartType: chartTypeBit,
                };
                return acc;
            }, {} as Record<string, DeepPartial<ISeriesStyle>>);

            if (!styleMap) {
                return;
            }

            setSeriesStyleMap(styleMap);
        } else {
            setSeriesStyleMap({
                [seriesId]: {
                    chartType: chartTypeBit,
                },
            });
        }
    }, [seriesId]);

    const seriesChartType = useSeriesChartType(ChartTypeBits.Combination, seriesId, service);

    const chartTypeStr = String(seriesChartType ?? '');
    return (
        <Select
            value={seriesChartType === ChartTypeBits.None ? '' : chartTypeStr}
            options={innerSeriesChartTypeOptions}
            onChange={setSeriesChartType}
        >
        </Select>
    );
};
