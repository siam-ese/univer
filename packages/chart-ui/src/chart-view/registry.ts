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
import { map } from 'rxjs';
import type { SheetsChartUIService } from '../services/sheets-chart-ui.service';

export function registryChartConfigState(service: SheetsChartUIService) {
    service.registerViewState('stack', (chartModel) => ({
        set(v) {
            Tools.set(chartModel, 'style.common.stack', v);
            chartModel.setStyle(chartModel.style);
        },
        get() {
            return chartModel.style$.pipe(map((style) => Boolean(style.common?.stack)));
        },
    }));
    service.registerViewState('chartType', (chartModel) => ({
        set(v) {
            Tools.set(chartModel, 'style.common.stack', v);
            chartModel.setChart(v);
        },
        get() {
            return chartModel.chartType$;
        },
    }));
}
