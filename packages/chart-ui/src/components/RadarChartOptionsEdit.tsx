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

import { defaultChartStyle } from '@univerjs/chart';
import { Checkbox } from '@univerjs/design';
import React from 'react';
import type { LocaleService } from '@univerjs/core';
import { useChartConfigState } from '../hooks';
import type { SheetsChartUIService } from '../services/sheets-chart-ui.service';
import { ButtonSwitch } from './button-switch';
import { radarShapeOptions } from './options';
import { useTranslatedOptions } from './use-translated-options';

export const RadarChartOptionsEdit = (props: {
    service: SheetsChartUIService;
    localeService: LocaleService;
    className?: string;
}) => {
    const { className, service, localeService } = props;
    const [radarShape, setRadarShape] = useChartConfigState('radarShape', service);
    const [radarFill, setRadarFill] = useChartConfigState('radarFill', service);
    const innerRadarShapeOptions = useTranslatedOptions(localeService, radarShapeOptions);

    return (
        <div className={className}>
            <div>
                <ButtonSwitch value={radarShape ?? defaultChartStyle.radar.shape} options={innerRadarShapeOptions} onChange={setRadarShape as (v: string) => void} />
            </div>
            <div className="chart-edit-panel-top-gap">
                <Checkbox
                    checked={!!radarFill}
                    onChange={(v) => {
                        setRadarFill(Boolean(v));
                    }}
                >
                    Fill
                </Checkbox>
            </div>
        </div>
    );
};
