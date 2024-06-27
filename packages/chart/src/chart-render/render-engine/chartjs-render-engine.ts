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

import type { ChartConfiguration } from 'chart.js';
import { Chart } from 'chart.js';
import { ChartRenderEngine } from './render-engine';

export type ChartSpec = ChartConfiguration;
export const ChartJSRenderEngineName = 'chart.js';
export class ChartJSRenderEngine extends ChartRenderEngine<ChartConfiguration> {
    static override name = ChartJSRenderEngineName;
    private _chart: Chart | null;

    override setData(spec: ChartConfiguration): void {
        // console.log(spec, 'chart spec');
        if (!this._chart) {
            const el = typeof this.container === 'string' ? document.getElementById(this.container) : this.container;
            if (el) {
                const canvas = document.createElement('canvas');
                el.appendChild(canvas);
                this._chart = new Chart(canvas, spec);
            }
        } else {
            this._chart.data.datasets = spec.data.datasets;
            this._chart.data.labels = spec.data.labels;
            this._chart.update();
        }

        this._chart?.render();
    }
}
