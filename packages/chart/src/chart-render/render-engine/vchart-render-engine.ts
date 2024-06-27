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

import VChart from '@visactor/vchart';
import type { ISpec } from '@visactor/vchart';
import { ChartRenderEngine } from './render-engine';

export type VChartSpec = ISpec;
export const VChartRenderEngineName = 'VChart';
export class VChartRenderEngine extends ChartRenderEngine<VChartSpec> {
    static override name = VChartRenderEngineName;
    private _vchart: VChart | null;

    override setData(spec: VChartSpec): void {
        // console.log(spec, 'chart spec');
        if (!this._vchart) {
            this._vchart = new VChart(spec, {
                dom: this.container,
            });
        } else {
            this._vchart.updateSpec(spec, false);
        }
        this._vchart.renderSync();
    }
}
