import { defaultInstance } from "../utils/axios";
import fs from 'fs';

export const postImageReview = async (
  images:string[]
) => {
    const responses = [];
  
  try {
    
    
    for (const image of images) {
    // 이미지 URI에서 파일 이름과 타입 추출
    const filename = image.split('/').pop();
    const fileType = 'image/jpeg'; // 실제 파일 타입에 맞게 조정이 필요합니다.

    const formData = new FormData();

    // FormData에 파일 객체 형태로 추가
    // 'file' 필드 이름은 API 명세에 따라 변경될 수 있습니다.
    formData.append('image', {
        uri: image,
        name: filename || 'upload.jpg',
        type: fileType,
    });

    console.log(`- 이미지 업로드 중: ${filename}`);

    const response = await defaultInstance.post('/images/review', formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });
    responses.push(response.data);
    console.log(`- 업로드 성공: ${filename}`);
    }
    console.log('모든 이미지 업로드가 완료되었습니다.');
    return responses;
        
    } catch (error) {
    console.error(
      '사진 전송 실패:',
      error,
    );
    throw error; // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 합니다.
  }
};
