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
import type { SeriesItemHandler } from './series-style-operator';

export const linePointStyleHandler: SeriesItemHandler = (series) => {
    // const stackType = style.stackType;
    if (['line', 'area'].includes(series.type)) {
        Tools.set(series, 'point.style.visible', false);
        Tools.set(series, 'point.state.dimension_hover.visible', true);
    }
};
