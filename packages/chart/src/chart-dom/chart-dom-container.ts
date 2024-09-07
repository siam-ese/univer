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

import type { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';

export function mountChartDom(floatDomService: SheetCanvasFloatDomManagerService) {
    return floatDomService.addFloatDomToPosition({
        allowTransform: true,
        initPosition: {
            startX: 200,
            endX: 400,
            startY: 200,
            endY: 400,
        },
        componentKey: 'Chart',
    });
}
export type ChartRenderHelper = (chartId: string) => Promise<{
    id: string | HTMLElement;
    dispose?: () => void;
}>;

