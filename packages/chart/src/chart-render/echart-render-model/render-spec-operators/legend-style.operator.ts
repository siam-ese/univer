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

import type { EChartRenderSpecOperator } from '../echart-render-engine';

export const legendStyleOperator: EChartRenderSpecOperator = (spec, style, config, instance) => {
    spec.legend = {
        show: true,
        bottom: 20,
        selectedMode: true,
        data: config.series.map((item) => ({
            name: item.name,
            icon: 'roundRect',
        })),
    };
};
