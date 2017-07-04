import AlarmClock from '../services/AlarmClock';
import AudioIn from '../services/AudioIn';
import AVTransport from '../services/AVTransport';
import ContentDirectory from '../services/ContentDirectory';
import DeviceProperties from '../services/DeviceProperties';
import GroupManagement from '../services/GroupManagement';
import MusicServices from '../services/MusicServices';
import SystemProperties from '../services/SystemProperties';
import ZoneGroupTopology from '../services/ZoneGroupTopology';

const Services = {
    AlarmClock: AlarmClock,
    AudioIn: AudioIn,
    AVTransport: AVTransport,
    ContentDirectory: ContentDirectory,
    DeviceProperties: DeviceProperties,
    GroupManagement: GroupManagement,
    MusicServices: MusicServices,
    SystemProperties: SystemProperties,
    ZoneGroupTopology: ZoneGroupTopology
};

export default Services;
