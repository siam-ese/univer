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

import { ChartTypeBits, defaultChartStyle } from '@univerjs/chart';

import type { LocaleService, Nullable } from '@univerjs/core';
import { useChartConfigState } from '../../hooks';
import type { SheetsChartUIService } from '../../services/sheets-chart-ui.service';

export interface ICombinationChartTypeSelectProps {
    localeService: LocaleService;
    service: SheetsChartUIService;
    seriesId: string;
}

const defaultCombination = defaultChartStyle.combination;

// get the chart type apply to edit series
export function useSeriesChartType(chartType: Nullable<ChartTypeBits>, seriesId: string, service: SheetsChartUIService) {
    const [seriesStyleMap] = useChartConfigState('seriesStyleMap', service);
    const [seriesValues] = useChartConfigState('seriesValues', service);

    const isAllSeriesStyle = seriesId === defaultChartStyle.allSeriesId;

    const currentSeriesStyle = seriesStyleMap?.[seriesId];

    if (chartType !== ChartTypeBits.Combination) {
        return chartType;
    }
    // Under combination chart type
    if (isAllSeriesStyle) {
        const getAllSeriesChartType = () => {
            const seriesChartBits = seriesValues?.map((id, index) => {
                const seriesStyle = seriesStyleMap?.[id];
                const fallbackChartTypeBit = index === 0 ? defaultCombination.firstChartType : defaultCombination.otherChartType;
                return seriesStyle?.chartType ?? fallbackChartTypeBit;
            });

            const seriesChartBit = seriesChartBits?.[0];
            const isSame = seriesChartBits?.every((bit) => bit === seriesChartBit);

            return isSame ? seriesChartBit : ChartTypeBits.None;
        };

        return getAllSeriesChartType();
    }

    const getSeriesChartType = () => {
        const fallbackChartTypeBit = seriesId === String(seriesValues?.[0]) ? defaultCombination.firstChartType : defaultCombination.otherChartType;

        return currentSeriesStyle?.chartType ?? fallbackChartTypeBit;
    };

    return getSeriesChartType();
}
