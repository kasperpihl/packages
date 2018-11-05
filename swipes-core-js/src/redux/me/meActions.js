import request from '../../utils/request';

export const uploadProfilePhoto = photo => (d, getState) => {
  const formData = new FormData();
  formData.append('token', getState().auth.get('token'));
  formData.append('photo', photo);
  return request(
    {
      command: 'me.uploadProfilePhoto',
      formData: true,
    },
    {
      photo,
    }
  );
};
