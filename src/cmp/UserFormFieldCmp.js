import React from 'react'
import {Grid,Form,Button,Checkbox} from 'semantic-ui-react' 

const UserFormFieldCmp = (props) => {
    const { location, stateKey, buttonText, userNameEntered, joinRoom, toggleAudioVideo } = props;
    return <Grid.Row>
    <Grid.Column width={3}>
      <Form >
      <Form.Field>
      <label>Enter Name</label>
      <input value={location.username} onChange={userNameEntered.bind(this, stateKey)} placeholder='Type your Name' />
      </Form.Field>
      <Button loading={location.showJoinRoomLoader} primary disabled={location.username === ''} onClick={joinRoom.bind(this, stateKey)}>{buttonText}</Button>
        <div style={{ padding: '5px'}}>
          <label style={{ paddingRight: '5px'}}>On Sound</label>
          <Checkbox style={{ verticalAlign: 'middle'}} value={'audio'} checked={!location.streamMuted.audioMuted} onClick={toggleAudioVideo.bind(this, stateKey)}/>
          <br/>
          <label style={{ paddingRight: '5px'}}>On Video</label>
          <Checkbox style={{ verticalAlign: 'middle'}} value={'video'} checked={!location.streamMuted.videoMuted} onClick={toggleAudioVideo.bind(this, stateKey)}/>
        </div>
    </Form>
    </Grid.Column>
    </Grid.Row>
  }
export default UserFormFieldCmp;