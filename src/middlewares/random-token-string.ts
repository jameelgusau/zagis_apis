import crypto from 'crypto';

const randomTokenString = () =>{
    return crypto.randomBytes(50).toString('hex');
}

export default randomTokenString;