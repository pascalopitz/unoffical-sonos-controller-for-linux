import _ from 'lodash';
import { Listener } from 'sonos';

/*
 * Sorry, not sorry!
 *
 * This is black magic. Basically node-sonos doesn't expose the classes for me to mess around with.
 * So we're grabbing object properties and mess with them directly, then use call/bind to invoke them
 * in the correct context. All this so we can add one more event subscriptions.
 */

async function subscribeTo(device) {
    const result = await this.__subscribeTo(device);
    const deviceSubscription = _.last(this._deviceSubscriptions);

    await deviceSubscription.addSubscription(
        '/MediaServer/ContentDirectory/Event'
    );

    device.on('UnknownEvent', ({ endpoint, eventBody }) => {
        if (endpoint === '/MediaServer/ContentDirectory/Event') {
            device.emit(
                'ContentDirectory',
                _.isArray(eventBody)
                    ? eventBody.reduce((prev, i) => ({ ...prev, ...i }), {})
                    : eventBody
            );
        }
    });

    return result;
}

Listener.__subscribeTo = Listener.subscribeTo;
Listener.subscribeTo = subscribeTo.bind(Listener);

export default Listener;
