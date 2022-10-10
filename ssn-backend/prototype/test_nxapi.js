import { addUserAgent } from 'nxapi';
import CoralApi, { CoralAuthData } from 'nxapi/coral';

addUserAgent('test-script/1.0.0 (+https://github.com/ShrimpCryptid)');



let coral;

try {
    const [auth_data, expires_at] = getCachedCoralToken();
    if (expires_at.getTime() > Date.now()) throw new Error('Token expired');

    coral = CoralApi.createWithSavedToken(auth_data);
} catch (err) {
    const na_session_token = getNintendoAccountSessionToken();
    const {nso, data} = await CoralApi.createWithSessionToken(na_session_token);
    setCachedCoralToken(data, Date.now() + (data.credential.expiresIn * 1000));
    coral = nso;
}

const friends = await coral.getFriendList();