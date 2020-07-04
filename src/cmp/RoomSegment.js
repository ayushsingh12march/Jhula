import React from 'react'
import {Grid} from 'semantic-ui-react'
import UserFormFieldCmp from './UserFormFieldCmp'
import LocalFeedColumn from './LocalFeedColumn'
import RemoteFeedColumn from './RemoteFeedColumn'
const RoomSegment = (props) => {
    const {
      location,
      stateKey,
      buttonText,
      joinRoom,
      toggleAudioVideo,
      userNameEntered,
      sendMessage,
      messageEntered,
      shareScreen,
      getUserMedia,
      stopStream,
      stopScreen,
      leaveRoom,
      onPeerSelected,
      onMessageChannelSelected,
      lockRoom,
      shareScreenReplace,
      getPeersStream,
      getPeers,
    } = props;
    return (
      <Grid celled='internally'>
      {
    !location.inRoom ? <UserFormFieldCmp
    location={location}
    stateKey={stateKey}
    buttonText={buttonText}
    joinRoom={joinRoom}
    toggleAudioVideo={toggleAudioVideo}
    userNameEntered={userNameEntered}
    /> : <Grid.Row>
    <LocalFeedColumn
    stateKey={stateKey}
    location={location}
    sendMessage={sendMessage}
    messageEntered={messageEntered}

    shareScreen={shareScreen}
    shareScreenReplace={shareScreenReplace}
    getUserMedia={getUserMedia}
    stopStream={stopStream}
    stopScreen={stopScreen}
    leaveRoom={leaveRoom}
    onPeerSelected={onPeerSelected}
    onMessageChannelSelected={onMessageChannelSelected}
    lockRoom={lockRoom}
    getPeersStream={getPeersStream}
    getPeers={getPeers}
    />
    <RemoteFeedColumn stateKey={stateKey} location={location} />
  </Grid.Row>
  }
  </Grid>
  )
  };

  export default RoomSegment