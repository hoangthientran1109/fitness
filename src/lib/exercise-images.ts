const EXERCISE_IMAGES: Record<string, string> = {
  'Đẩy Ngực Barbell': 'Barbell_Bench_Press_-_Medium_Grip',
  'Đẩy Ngực Dumbbell Ghế Dốc': 'Incline_Dumbbell_Press',
  'Ép Ngực Cable': 'Cable_Crossover',
  'Hít Đất': 'Push-Up_Wide',
  'Máy Đẩy Ngực': 'Leverage_Chest_Press',
  'Hít Xà Đơn': 'Wide-Grip_Rear_Pull-Up',
  'Chèo Barbell': 'Bent_Over_Barbell_Row',
  'Kéo Xô Máy': 'Wide-Grip_Lat_Pulldown',
  'Chèo Cable Ngồi': 'Seated_Cable_Rows',
  'Chèo Dumbbell Một Tay': 'One-Arm_Dumbbell_Row',
  'Deadlift': 'Barbell_Deadlift',
  'Kéo Mặt (Face Pull)': 'Face_Pull',
  'Đẩy Vai Barbell': 'Barbell_Shoulder_Press',
  'Đẩy Vai Dumbbell': 'Dumbbell_Shoulder_Press',
  'Nâng Vai Giữa': 'Side_Lateral_Raise',
  'Nâng Vai Trước': 'Front_Dumbbell_Raise',
  'Ép Vai Sau Dumbbell': 'Reverse_Flyes',
  'Cuốn Tạ Barbell': 'Barbell_Curl',
  'Cuốn Tạ Dumbbell': 'Dumbbell_Bicep_Curl',
  'Hammer Curl': 'Hammer_Curls',
  'Cuốn Tạ Ghế Preacher': 'Preacher_Curl',
  'Concentration Curl': 'Concentration_Curls',
  'Đẩy Tay Sau Cable': 'Triceps_Pushdown',
  'Skull Crusher': 'EZ-Bar_Skullcrusher',
  'Đẩy Tay Sau Qua Đầu': 'Standing_Dumbbell_Triceps_Extension',
  'Đẩy Ngực Tay Hẹp': 'Close-Grip_Barbell_Bench_Press',
  'Hít Đất Kim Cương': 'Push-Ups_-_Close_Triceps_Position',
  'Squat Barbell': 'Barbell_Full_Squat',
  'Front Squat': 'Front_Barbell_Squat',
  'Romanian Deadlift (RDL)': 'Romanian_Deadlift',
  'Leg Press': 'Leg_Press',
  'Walking Lunge': 'Barbell_Walking_Lunge',
  'Leg Curl': 'Lying_Leg_Curls',
  'Leg Extension': 'Leg_Extensions',
  'Nhún Bắp Chân': 'Standing_Calf_Raises',
  'Hip Thrust': 'Barbell_Hip_Thrust',
  'Bulgarian Split Squat': 'Split_Squats',
  'Đạp Mông Cable': 'Glute_Kickback',
  'Dạng Hông Cable': 'Cable_Hip_Adduction',
  'Plank': 'Plank',
  'Nâng Chân Treo Xà': 'Hanging_Leg_Raise',
  'Cable Crunch': 'Cable_Crunch',
  'Russian Twist': 'Russian_Twist',
  'Ab Wheel Rollout': 'Barbell_Ab_Rollout',
  'Nhảy Dây': 'Rope_Jumping',
  'Máy Chèo': 'Rowing_Stationary',
  'Đi Bộ Dốc Máy Chạy': 'Walking_Treadmill',
  'Đẩy Ngực Ghế Dốc Xuống': 'Decline_Barbell_Bench_Press',
  'Giãn Cơ Lưng': 'Childs_Pose',
  'Giãn Cơ Toàn Thân': 'Kneeling_Hip_Flexor',
};

export const BASE_IMAGE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
export const REPO_URL = 'https://github.com/yuhonas/free-exercise-db/tree/main/exercises';

export function getExerciseImage(name: string): string | null {
  const id = EXERCISE_IMAGES[name];
  return id ? `${BASE_IMAGE_URL}${id}/0.jpg` : null;
}

export function getExerciseGifMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, id] of Object.entries(EXERCISE_IMAGES)) {
    out[name] = `${BASE_IMAGE_URL}${id}/0.jpg`;
  }
  return out;
}
