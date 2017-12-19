import MusicServiceClient from '../MusicServiceClient';
import request from 'request';

jest.mock('request');

function mockSoapResponse(name, value) {
    return `<Envelope>
        <Body>
            <${name}Response>
                <${name}Result>${value}</${name}Result>
            </${name}Response>
        </Body>
    </Envelope>`;
}

describe('MusicServiceClient', () => {
    let client;

    beforeEach(() => {
        client = new MusicServiceClient({
            Name: 'Service'
        });
    });

    describe('getDeviceLinkCode', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('getDeviceLinkCode', expectedReturn)
                )
            );

            const res = await client.getDeviceLinkCode();
            expect(res).toBe(expectedReturn);
        });
    });

    describe('getAppLink', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse(
                        'getAppLink',
                        `<authorizeAccount>
                            <deviceLink>${expectedReturn}</deviceLink>
                        </authorizeAccount>`
                    )
                )
            );

            const res = await client.getAppLink();
            expect(res).toBe(expectedReturn);
        });
    });

    describe('getDeviceAuthToken', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('getDeviceAuthToken', expectedReturn)
                )
            );

            const res = await client.getDeviceAuthToken(
                'linkCode',
                'linkDeviceId'
            );
            expect(res).toBe(expectedReturn);
        });
    });

    describe('getMetadata', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('getMetadata', expectedReturn)
                )
            );

            const res = await client.getMetadata('id');
            expect(res).toBe(expectedReturn);
        });
    });

    describe('getExtendedMetadata', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('getExtendedMetadata', expectedReturn)
                )
            );

            const res = await client.getExtendedMetadata('id');
            expect(res).toBe(expectedReturn);
        });
    });

    describe('search', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('search', expectedReturn)
                )
            );

            const res = await client.search('id', 'term');
            expect(res).toBe(expectedReturn);
        });
    });

    describe('getMediaURI', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('getMediaURI', expectedReturn)
                )
            );

            const res = await client.getMediaURI('id');
            expect(res).toBe(expectedReturn);
        });
    });

    describe('getSessionId', () => {
        it('sends SOAP request, returns response', async () => {
            const expectedReturn = 'Res';

            request.mockImplementationOnce((params, cb) =>
                cb(
                    null,
                    {
                        statusCode: 200
                    },
                    mockSoapResponse('getSessionId', expectedReturn)
                )
            );

            const res = await client.getSessionId('username', 'password');
            expect(res).toBe(expectedReturn);
        });
    });
});
