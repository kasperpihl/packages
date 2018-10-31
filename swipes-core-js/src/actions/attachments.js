import * as a from './';
import { valAction } from '../classes/utils';

import { object, array, string } from 'valjs';

export const add = valAction(
  'attachments.add',
  [
    string.require(),
    object
      .as({
        service: object
          .as({
            id: string.require(),
            name: string.require(),
            type: string.require(),
          })
          .require(),
        meta: object
          .as({
            title: string.require(),
          })
          .require(),
        permission: object
          .as({
            short_url: string.require(),
          })
          .require(),
      })
      .require(),
    string,
  ],
  (targetId, link, title) => d =>
    d(
      a.api.request('attachments.add', {
        target_id: targetId,
        link,
        title,
      })
    )
);
