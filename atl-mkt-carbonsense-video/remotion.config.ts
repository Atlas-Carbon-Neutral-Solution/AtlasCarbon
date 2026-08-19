import {Config} from '@remotion/cli/config';

// Il render non è approvazione: vedi README §6 e docs/COMPLIANCE_DELTA.md.
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(18);
