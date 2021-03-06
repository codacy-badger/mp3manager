const fpcalc = require('fpcalc');
const _ = require('underscore');
const request = require('request-promise-native');

/**
 * Do not make more than 3 requests per second.
 * No commercial usage
 */
class AcusticId {
    constructor(key) {
        this.key = key;
        this.endpoint = 'https://api.acoustid.org/v2/lookup';

        if (_.isEmpty(this.key)) {
            throw new Error('API key required: https://acoustid.org/new-application');
        }
    }

    /**
     * It calculates an AcousticID fingerprint. Using different versions of the library,
     * produces a different hash.
     * @param {String|Stream} obj it must be the path to an audio file or a readable stream.
     * If using a stream, note that you will not get duration out due to an fpcalc issue
    */
    static getAcusticId(obj) {
        return new Promise((resolve, reject) => {
            fpcalc(obj, (err, result) => {
                if (err) {
                    return reject(err);
                }

                return resolve(result);
            });
        });
    }

    /**
     * If you have an audio fingerprint generated by Chromaprint, you can use this method
     * to lookup the MusicBrainz metadata associated with this fingerprint.
     * @param {Object} params https://acoustid.org/webservice#lookup
     * @returns {Promise} AcousticID and MusicBrainz metadata
     */
    lookupByFingerprint(params) {
        if (_.isEmpty(params) ||
            !params.hasOwnProperty('fingerprint') ||
            !params.hasOwnProperty('duration')) {
            throw new Error('client, duration and fingerprint are required');
        }

        const { duration, fingerprint } = params;
        const meta = 'recordings recordingids releases releaseids releasegroups releasegroupids tracks compress usermeta sources';

        const options = {
            uri: this.endpoint,
            qs: {
                format: 'json',
                client: this.key,
                duration,
                fingerprint,
                meta,
            },
            headers: {
                'User-Agent': 'mp3manager',
            },
            json: true,
        };

        return request(options)
            .then((result) => result)
            .catch((e) => {
                const parts = e.message.split(' - ');
                const response = JSON.parse(parts[1]);
                const [httpStatus] = parts;
                response.httpStatus = httpStatus;
                return response;
            });
    }

    /**
     * You can also look up data connected to a track ID, wich is a
     * cluster of fingerprints..
     * @param {Object} params https://acoustid.org/webservice#lookup_by_trackid
     * @returns {Promise} AcousticID and MusicBrainz metadata
     */
    lookupByTrackId(params) {
        if (_.isEmpty(params) ||
            !params.hasOwnProperty('trackid')) {
            throw new Error('trackid is required');
        }

        const { trackid } = params; // track id (UUID)
        const meta = 'recordings recordingids releases releaseids releasegroups releasegroupids tracks compress usermeta sources';

        const options = {
            uri: this.endpoint,
            qs: {
                format: 'json',
                client: this.key,
                trackid,
                meta,
            },
            headers: {
                'User-Agent': 'mp3manager',
            },
            json: true,
        };

        return request(options)
            .then((result) => result)
            .catch((e) => {
                const parts = e.message.split(' - ');
                const response = JSON.parse(parts[1]);
                const [httpStatus] = parts;
                response.httpStatus = httpStatus;
                return response;
            });
    }

    /**
     * List AcoustIDs by MBID
     * @param {Object} params https://acoustid.org/webservice#list_by_mbid
     * @returns {Promise} AcousticID and MusicBrainz metadata
     */
    listIDsByMBID(params) {
        if (_.isEmpty(params) ||
            !params.hasOwnProperty('mbid')) {
            throw new Error('mbid is required');
        }

        const { mbid } = params; // MusicBrainz recording ID (can be sent multiple times)
        const meta = 'recordings recordingids releases releaseids releasegroups releasegroupids tracks compress usermeta sources';

        const options = {
            uri: this.endpoint,
            qs: {
                format: 'json',
                client: this.key,
                mbid,
                meta,
            },
            headers: {
                'User-Agent': 'mp3manager',
            },
            json: true,
        };

        return request(options)
            .then((result) => result)
            .catch((e) => {
                const parts = e.message.split(' - ');
                const response = JSON.parse(parts[1]);
                const [httpStatus] = parts;
                response.httpStatus = httpStatus;
                return response;
            });
    }
}

module.exports = AcusticId;
