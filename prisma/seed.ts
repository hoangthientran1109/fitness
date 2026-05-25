import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang tạo dữ liệu...');

  await prisma.exerciseLog.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutDay.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.bodyMetric.deleteMany();
  await prisma.dailyCheckIn.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.aiCoachInsight.deleteMany();
  await prisma.fitnessGoal.deleteMany();
  await prisma.personalRule.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.userProfile.deleteMany();

  const user = await prisma.userProfile.create({
    data: { name: 'Thien', gender: 'male', age: 30, height: 175, weight: 75, bodyFat: 18, activityLevel: 'moderately_active', experienceLevel: 'intermediate' },
  });

  await prisma.fitnessGoal.create({
    data: { userId: user.id, goalType: 'body_recomposition', startWeight: 75, targetWeight: 72, targetBodyFat: 14, priority: 'primary', status: 'active' },
  });

  await prisma.personalRule.createMany({
    data: [
      { userId: user.id, ruleType: 'training', description: 'Không tập quá 60 phút mỗi buổi', isActive: true },
      { userId: user.id, ruleType: 'training', description: 'Chủ nhật là ngày nghỉ hoàn toàn', isActive: true },
      { userId: user.id, ruleType: 'training', description: 'Ngủ dưới 6 tiếng thì giảm intensity 20%', isActive: true },
      { userId: user.id, ruleType: 'training', description: 'Đau gối thì thay squat bằng leg press', isActive: true },
      { userId: user.id, ruleType: 'training', description: 'Ưu tiên phát triển vai và ngực', isActive: true },
      { userId: user.id, ruleType: 'nutrition', description: 'Không ăn đồ chiên rán', isActive: true },
      { userId: user.id, ruleType: 'nutrition', description: 'Hạn chế đường và đồ ngọt', isActive: true },
      { userId: user.id, ruleType: 'recovery', description: 'Stress > 7 thì thêm 1 recovery day', isActive: true },
    ],
  });

  const exerciseData = [
    { name: 'Đẩy Ngực Barbell', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Tay Sau, Vai Trước', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Nằm trên ghế phẳng. Tay cầm rộng hơn vai. Hạ đòn xuống giữa ngực, đẩy lên mạnh mẽ. Giữ vai siết chặt.', commonMistakes: 'Mở khuỷu tay quá rộng. Nảy đòn trên ngực. Không siết bả vai.', alternatives: 'Đẩy Ngực Dumbbell, Máy Đẩy Ngực, Hít Đất' },
    { name: 'Đẩy Ngực Dumbbell Ghế Dốc', category: 'chest', mainMuscle: 'Ngực Trên', secondaryMuscle: 'Tay Sau, Vai Trước', equipment: 'dumbbell', difficulty: 'intermediate', instruction: 'Chỉnh ghế 30-45 độ. Đẩy tạ từ ngang vai lên, siết ngực ở đỉnh. Kiểm soát khi hạ.', commonMistakes: 'Ghế dốc quá cao. Không xuống đủ sâu. Khuỷu tay mở rộng.', alternatives: 'Đẩy Ngực Barbell Ghế Dốc, Máy Đẩy Ngực Dốc' },
    { name: 'Ép Ngực Cable', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Vai Trước', equipment: 'cable', difficulty: 'beginner', instruction: 'Chỉnh cable ngang vai. Bước về trước, kéo hai tay vào nhau theo hình vòng cung. Siết ngực ở giữa.', commonMistakes: 'Dùng tạ quá nặng. Gập khuỷu tay quá nhiều.', alternatives: 'Ép Ngực Dumbbell, Máy Pec Deck' },
    { name: 'Đẩy Ngực Ghế Dốc Xuống', category: 'chest', mainMuscle: 'Ngực Dưới', secondaryMuscle: 'Tay Sau', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Chỉnh ghế dốc nhẹ xuống. Tay cầm rộng hơn vai. Hạ xuống ngực dưới, đẩy lên.', commonMistakes: 'Góc dốc quá nhiều. Không dùng chốt an toàn.', alternatives: 'Dips, Đẩy Ngực Dumbbell Dốc Xuống' },
    { name: 'Hít Đất', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Tay Sau, Bụng', equipment: 'bodyweight', difficulty: 'beginner', instruction: 'Hai tay rộng bằng vai. Giữ thân thẳng. Hạ ngực xuống sát đất, đẩy lên.', commonMistakes: 'Hông xệ. Không xuống đủ sâu. Tay quá rộng.', alternatives: 'Hít Đất Quỳ Gối, Hít Đất Dốc' },
    { name: 'Máy Đẩy Ngực', category: 'chest', mainMuscle: 'Ngực', secondaryMuscle: 'Tay Sau', equipment: 'machine', difficulty: 'beginner', instruction: 'Chỉnh ghế sao cho tay cầm ngang giữa ngực. Đẩy về trước đều, kiểm soát khi về.', commonMistakes: 'Dùng quán tính. Khóa khớp ở đỉnh.', alternatives: 'Đẩy Ngực Smith Machine' },
    { name: 'Hít Xà Đơn', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'bodyweight', difficulty: 'intermediate', instruction: 'Tay cầm rộng hơn vai, lòng bàn tay hướng ra ngoài. Kéo cằm qua xà, hạ có kiểm soát.', commonMistakes: 'Đánh lưng. Không xuống hết tay. Cằm không qua xà.', alternatives: 'Kéo Xô Máy, Hít Xà Có Trợ Lực' },
    { name: 'Chèo Barbell', category: 'back', mainMuscle: 'Lưng Giữa', secondaryMuscle: 'Tay Trước, Vai Sau', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Gập hông, lưng thẳng 45 độ. Kéo đòn lên ngực dưới, siết bả vai. Hạ có kiểm soát.', commonMistakes: 'Lưng dưới cong. Dùng quán tính. Đứng quá thẳng.', alternatives: 'Chèo T-Bar, Chèo Dumbbell, Chèo Cable' },
    { name: 'Kéo Xô Máy', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'cable', difficulty: 'beginner', instruction: 'Tay cầm rộng, ngả nhẹ về sau. Kéo thanh xuống ngực trên, siết xô.', commonMistakes: 'Ngả quá xa. Kéo ra sau cổ. Dùng quán tính.', alternatives: 'Hít Xà Đơn, Kéo Xô Tay Thẳng' },
    { name: 'Chèo Cable Ngồi', category: 'back', mainMuscle: 'Lưng Giữa', secondaryMuscle: 'Tay Trước', equipment: 'cable', difficulty: 'beginner', instruction: 'Ngồi, chân đặt trên bục, gối hơi gập. Kéo về bụng, siết bả vai.', commonMistakes: 'Lưng cong. Không siết ở đỉnh.', alternatives: 'Chèo Barbell, Chèo Dumbbell' },
    { name: 'Chèo Dumbbell Một Tay', category: 'back', mainMuscle: 'Xô', secondaryMuscle: 'Tay Trước', equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Một gối và một tay chống ghế. Kéo tạ lên hông, siết xô. Kiểm soát khi hạ.', commonMistakes: 'Xoay thân. Không xuống đủ sâu.', alternatives: 'Chèo Barbell, Chèo Cable' },
    { name: 'Deadlift', category: 'back', mainMuscle: 'Cơ Dựng Sống', secondaryMuscle: 'Mông, Đùi Sau', equipment: 'barbell', difficulty: 'advanced', instruction: 'Chân rộng bằng hông. Tay cầm ngoài chân. Lưng thẳng, ngực ưỡn. Đẩy qua gót chân.', commonMistakes: 'Lưng dưới cong. Hông nâng quá nhanh.', alternatives: 'RDL, Deadlift Trap Bar, Rack Pull' },
    { name: 'Kéo Mặt (Face Pull)', category: 'shoulder', mainMuscle: 'Vai Sau', secondaryMuscle: 'Xoay Vai, Cầu Vai', equipment: 'cable', difficulty: 'beginner', instruction: 'Cable ngang mặt. Kéo dây về mặt, tách hai đầu dây. Siết vai sau.', commonMistakes: 'Tạ quá nặng. Không tách dây. Kéo bằng tay trước.', alternatives: 'Reverse Pec Deck, Kéo Dây Band' },
    { name: 'Đẩy Vai Barbell', category: 'shoulder', mainMuscle: 'Vai', secondaryMuscle: 'Tay Sau, Ngực Trên', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Đứng, đòn ngang xương đòn. Đẩy lên qua đầu, khóa ở đỉnh.', commonMistakes: 'Ưỡn lưng dưới. Không khóa hết.', alternatives: 'Đẩy Vai Dumbbell, Push Press' },
    { name: 'Đẩy Vai Dumbbell', category: 'shoulder', mainMuscle: 'Vai', secondaryMuscle: 'Tay Sau', equipment: 'dumbbell', difficulty: 'intermediate', instruction: 'Ngồi có tựa lưng. Đẩy tạ từ ngang vai lên qua đầu. Kiểm soát khi hạ.', commonMistakes: 'Ưỡn lưng. Không đủ tầm vận động.', alternatives: 'Arnold Press, Máy Đẩy Vai' },
    { name: 'Nâng Vai Giữa', category: 'shoulder', mainMuscle: 'Vai Giữa', secondaryMuscle: 'Cầu Vai', equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Cầm tạ hai bên. Nâng tay lên ngang vai, khuỷu tay hơi gập. Dừng ở đỉnh.', commonMistakes: 'Vung tạ. Nhún vai. Tạ quá nặng.', alternatives: 'Nâng Vai Cable, Máy Nâng Vai' },
    { name: 'Nâng Vai Trước', category: 'shoulder', mainMuscle: 'Vai Trước', secondaryMuscle: 'Ngực Trên', equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Cầm tạ trước đùi. Nâng từng tay lên ngang vai.', commonMistakes: 'Vung tạ. Nâng quá cao.', alternatives: 'Nâng Vai Trước Cable' },
    { name: 'Ép Vai Sau Dumbbell', category: 'shoulder', mainMuscle: 'Vai Sau', secondaryMuscle: 'Cầu Vai', equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Gập người, lưng thẳng. Nâng tạ ra hai bên, siết ở đỉnh.', commonMistakes: 'Đứng quá thẳng. Dùng quán tính.', alternatives: 'Face Pull, Reverse Pec Deck' },
    { name: 'Cuốn Tạ Barbell', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: 'Cẳng Tay', equipment: 'barbell', difficulty: 'beginner', instruction: 'Đứng, đòn ngang đùi, lòng bàn tay hướng trước. Cuốn lên vai không vung thân.', commonMistakes: 'Vung thân. Không đủ tầm vận động.', alternatives: 'Cuốn Tạ Dumbbell, Cuốn EZ Bar' },
    { name: 'Cuốn Tạ Dumbbell', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: 'Cẳng Tay', equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Cầm tạ hai bên. Cuốn lên giữ khuỷu tay cố định. Siết ở đỉnh.', commonMistakes: 'Vung tạ. Khuỷu tay di chuyển.', alternatives: 'Hammer Curl, Cuốn Cable' },
    { name: 'Hammer Curl', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: 'Cẳng Tay', equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Cầm tạ, lòng bàn tay hướng vào nhau. Cuốn lên giữ grip trung tính.', commonMistakes: 'Vung thân. Dùng chân tạo đà.', alternatives: 'Reverse Curl, Hammer Curl Dây' },
    { name: 'Cuốn Tạ Ghế Preacher', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: null, equipment: 'machine', difficulty: 'intermediate', instruction: 'Ngồi ghế preacher. Cuốn tạ lên, siết ở đỉnh. Hạ xuống hết.', commonMistakes: 'Không xuống hết. Dùng quán tính.', alternatives: 'Concentration Curl' },
    { name: 'Concentration Curl', category: 'biceps', mainMuscle: 'Tay Trước', secondaryMuscle: null, equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Ngồi, khuỷu tay chống đùi trong. Cuốn tạ lên, siết. Hạ chậm.', commonMistakes: 'Dùng thân hỗ trợ. Không cô lập.', alternatives: 'Cuốn Preacher, Cuốn Cable' },
    { name: 'Đẩy Tay Sau Cable', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: null, equipment: 'cable', difficulty: 'beginner', instruction: 'Cầm thanh/dây trên pulley cao. Đẩy xuống đến khi tay duỗi thẳng. Siết tay sau.', commonMistakes: 'Khuỷu tay di chuyển. Không duỗi hết.', alternatives: 'Skull Crusher, Đẩy Qua Đầu' },
    { name: 'Skull Crusher', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: null, equipment: 'barbell', difficulty: 'intermediate', instruction: 'Nằm, cầm EZ bar trên mặt. Hạ xuống trán bằng cách gập khuỷu tay. Duỗi lên.', commonMistakes: 'Khuỷu tay mở rộng. Tạ quá nặng.', alternatives: 'Đẩy Tay Sau Cable' },
    { name: 'Đẩy Tay Sau Qua Đầu', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: null, equipment: 'dumbbell', difficulty: 'beginner', instruction: 'Đứng/ngồi, cầm tạ trên đầu. Hạ ra sau đầu, duỗi lên. Khuỷu tay sát đầu.', commonMistakes: 'Khuỷu tay mở rộng. Ưỡn lưng.', alternatives: 'Đẩy Qua Đầu Cable' },
    { name: 'Đẩy Ngực Tay Hẹp', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: 'Ngực', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Tay cầm rộng bằng vai. Hạ xuống ngực dưới, đẩy bằng tay sau.', commonMistakes: 'Tay quá hẹp. Không kiểm soát.', alternatives: 'Hít Đất Kim Cương' },
    { name: 'Hít Đất Kim Cương', category: 'triceps', mainMuscle: 'Tay Sau', secondaryMuscle: 'Ngực', equipment: 'bodyweight', difficulty: 'intermediate', instruction: 'Tay tạo hình kim cương dưới ngực. Hạ xuống, đẩy lên bằng tay sau.', commonMistakes: 'Khuỷu mở rộng. Không đủ sâu.', alternatives: 'Đẩy Ngực Tay Hẹp' },
    { name: 'Squat Barbell', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông, Đùi Sau', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Đòn đặt trên lưng trên. Chân rộng bằng vai. Squat xuống song song, ngực ưỡn.', commonMistakes: 'Gối sụp vào. Gót nhấc lên. Lưng cong.', alternatives: 'Goblet Squat, Leg Press, Front Squat' },
    { name: 'Front Squat', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông, Bụng', equipment: 'barbell', difficulty: 'advanced', instruction: 'Đòn đặt trên vai trước, khuỷu cao. Squat giữ thân thẳng.', commonMistakes: 'Khuỷu tay tụt xuống. Ngả về trước.', alternatives: 'Goblet Squat' },
    { name: 'Romanian Deadlift (RDL)', category: 'legs', mainMuscle: 'Đùi Sau', secondaryMuscle: 'Mông, Lưng Dưới', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Cầm đòn ngang hông. Đẩy hông ra sau, đòn trượt dọc chân. Cảm nhận căng đùi sau.', commonMistakes: 'Lưng cong. Gập gối quá nhiều.', alternatives: 'Stiff-Leg Deadlift, Leg Curl' },
    { name: 'Leg Press', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông', equipment: 'machine', difficulty: 'beginner', instruction: 'Chân rộng bằng vai trên bục. Hạ đến gối 90 độ. Đẩy lên không khóa gối.', commonMistakes: 'Khóa gối. Xuống quá sâu.', alternatives: 'Squat, Hack Squat' },
    { name: 'Walking Lunge', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông, Đùi Sau', equipment: 'dumbbell', difficulty: 'intermediate', instruction: 'Cầm tạ. Bước về trước, hạ gối sau gần sàn. Đẩy qua gót đứng lên.', commonMistakes: 'Gối qua mũi chân. Ngả về trước.', alternatives: 'Reverse Lunge, Bulgarian Split Squat' },
    { name: 'Leg Curl', category: 'legs', mainMuscle: 'Đùi Sau', secondaryMuscle: null, equipment: 'machine', difficulty: 'beginner', instruction: 'Nằm sấp, đệm sau mắt cá. Cuốn chân lên, siết đùi sau. Kiểm soát khi hạ.', commonMistakes: 'Dùng quán tính. Không đủ tầm.', alternatives: 'Nordic Curl, RDL' },
    { name: 'Leg Extension', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: null, equipment: 'machine', difficulty: 'beginner', instruction: 'Ngồi, đệm trên ống chân. Duỗi chân hoàn toàn, siết đùi trước.', commonMistakes: 'Vung tạ. Tập quá nhanh.', alternatives: 'Sissy Squat, Bulgarian Split Squat' },
    { name: 'Nhún Bắp Chân', category: 'legs', mainMuscle: 'Bắp Chân', secondaryMuscle: null, equipment: 'machine', difficulty: 'beginner', instruction: 'Vai dưới đệm. Nhón mũi chân cao nhất có thể, siết. Hạ chậm.', commonMistakes: 'Nảy. Không đủ tầm.', alternatives: 'Nhún Bắp Chân Ngồi' },
    { name: 'Hip Thrust', category: 'glutes', mainMuscle: 'Mông', secondaryMuscle: 'Đùi Sau', equipment: 'barbell', difficulty: 'intermediate', instruction: 'Lưng trên tựa ghế, đòn ngang hông. Đẩy hông lên siết mông ở đỉnh.', commonMistakes: 'Không siết mông. Ưỡn lưng.', alternatives: 'Glute Bridge, Cable Kickback' },
    { name: 'Bulgarian Split Squat', category: 'legs', mainMuscle: 'Đùi Trước', secondaryMuscle: 'Mông', equipment: 'dumbbell', difficulty: 'advanced', instruction: 'Chân sau đặt ghế. Cầm tạ. Hạ thân, đẩy qua gót trước.', commonMistakes: 'Gối sụp. Bước ngắn.', alternatives: 'Lunge, Step-up' },
    { name: 'Đạp Mông Cable', category: 'glutes', mainMuscle: 'Mông', secondaryMuscle: null, equipment: 'cable', difficulty: 'beginner', instruction: 'Gắn dây đeo cổ chân vào cable. Đạp chân ra sau, siết mông.', commonMistakes: 'Vung chân. Không siết.', alternatives: 'Donkey Kick, Hip Thrust' },
    { name: 'Dạng Hông Cable', category: 'glutes', mainMuscle: 'Mông Giữa', secondaryMuscle: null, equipment: 'cable', difficulty: 'beginner', instruction: 'Đứng ngang cable. Nâng chân ngoài ra xa thân. Siết mông giữa.', commonMistakes: 'Nghiêng người. Không kiểm soát.', alternatives: 'Máy Dạng Hông, Band Side Walk' },
    { name: 'Plank', category: 'core', mainMuscle: 'Bụng', secondaryMuscle: 'Vai, Lưng Dưới', equipment: 'bodyweight', difficulty: 'beginner', instruction: 'Khuỷu tay dưới vai, thân thẳng. Siết bụng và mông. Giữ tư thế.', commonMistakes: 'Hông xệ. Hông quá cao. Nín thở.', alternatives: 'Plank Nghiêng, Ab Wheel, Dead Bug' },
    { name: 'Nâng Chân Treo Xà', category: 'core', mainMuscle: 'Bụng', secondaryMuscle: 'Cơ Gập Hông', equipment: 'bodyweight', difficulty: 'advanced', instruction: 'Treo xà. Nâng chân lên 90 độ. Kiểm soát, không đánh đu.', commonMistakes: 'Đánh đu. Chỉ dùng cơ hông.', alternatives: 'Nâng Chân Nằm, Cable Crunch' },
    { name: 'Cable Crunch', category: 'core', mainMuscle: 'Bụng', secondaryMuscle: null, equipment: 'cable', difficulty: 'beginner', instruction: 'Quỳ đối diện cable, dây sau đầu. Gập bụng, khuỷu về gối.', commonMistakes: 'Kéo bằng tay. Tạ quá nặng.', alternatives: 'Crunch, Máy Crunch' },
    { name: 'Russian Twist', category: 'core', mainMuscle: 'Cơ Liên Sườn', secondaryMuscle: 'Bụng', equipment: 'bodyweight', difficulty: 'beginner', instruction: 'Ngồi, gối gập, ngả nhẹ. Xoay thân sang hai bên.', commonMistakes: 'Chỉ di chuyển tay. Lưng cong.', alternatives: 'Cable Woodchop, Plank Nghiêng' },
    { name: 'Ab Wheel Rollout', category: 'core', mainMuscle: 'Bụng', secondaryMuscle: 'Xô, Vai', equipment: 'bodyweight', difficulty: 'advanced', instruction: 'Quỳ giữ bánh xe ab. Lăn về trước, giữ bụng siết. Lăn về.', commonMistakes: 'Lưng xệ. Lăn quá xa.', alternatives: 'Plank, Dead Bug' },
    { name: 'Nhảy Dây', category: 'cardio', mainMuscle: 'Tim Mạch', secondaryMuscle: 'Bắp Chân', equipment: 'bodyweight', difficulty: 'beginner', instruction: 'Nhảy hai chân khi dây qua. Tiếp đất nhẹ bằng mũi chân.', commonMistakes: 'Nhảy quá cao. Tiếp đất cả bàn.', alternatives: 'Chạy Tại Chỗ, Máy Chạy' },
    { name: 'Máy Chèo', category: 'cardio', mainMuscle: 'Tim Mạch', secondaryMuscle: 'Lưng, Chân', equipment: 'machine', difficulty: 'beginner', instruction: 'Cài chân. Đẩy chân trước, rồi kéo tay về ngực. Nhịp đều.', commonMistakes: 'Kéo tay trước. Lưng cong.', alternatives: 'Battle Rope, Xe Đạp' },
    { name: 'Đi Bộ Dốc Máy Chạy', category: 'cardio', mainMuscle: 'Tim Mạch', secondaryMuscle: 'Mông, Đùi Sau', equipment: 'machine', difficulty: 'beginner', instruction: 'Dốc 10-15%, tốc độ 4-6 km/h. Đi không bám tay vịn.', commonMistakes: 'Bám tay vịn. Ngả trước.', alternatives: 'Stair Master, Đi Bộ Dốc' },
    { name: 'Giãn Cơ Lưng', category: 'mobility', mainMuscle: 'Cột Sống', secondaryMuscle: 'Bụng', equipment: 'bodyweight', difficulty: 'beginner', instruction: 'Chống tay gối. Cong lưng lên rồi võng xuống. Theo nhịp thở.', commonMistakes: 'Quá nhanh. Không phối hợp thở.', alternatives: 'Tư Thế Em Bé' },
    { name: 'Giãn Cơ Toàn Thân', category: 'mobility', mainMuscle: 'Hông / Ngực', secondaryMuscle: 'Đùi Sau', equipment: 'bodyweight', difficulty: 'beginner', instruction: 'Bước chân phải dài về trước, tay trái chống sàn. Xoay thân sang phải, vươn tay phải lên trần.', commonMistakes: 'Không xoay hết. Làm vội.', alternatives: 'Spiderman Stretch' },
  ];

  for (const ex of exerciseData) {
    await prisma.exercise.create({ data: ex as any });
  }

  const allExercises = await prisma.exercise.findMany();

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  fourWeeksAgo.setHours(0, 0, 0, 0);

  const workoutPlan = await prisma.workoutPlan.create({
    data: { userId: user.id, name: 'Lịch 5 Ngày PPL', type: 'push_pull_legs', startDate: fourWeeksAgo, daysPerWeek: 5, status: 'active' },
  });

  function getMonday(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const monday = getMonday(fourWeeksAgo);
  const catMap: Record<string, string[]> = {
    chest: ['Ngực'], back: ['Lưng Giữa', 'Xô'], shoulder: ['Vai'], triceps: ['Tay Sau'], biceps: ['Tay Trước'],
    legs: ['Đùi Trước', 'Đùi Sau'], glutes: ['Mông'],
  };

  const workoutConfigs = [
    { focus: 'Đẩy - Ngực & Vai', cats: ['chest', 'triceps'] },
    { focus: 'Kéo - Lưng & Tay Trước', cats: ['back', 'biceps'] },
    { focus: 'Chân - Đùi Trước & Mông', cats: ['legs', 'glutes'] },
    { focus: 'Đẩy - Vai & Tay Sau', cats: ['shoulder'] },
    { focus: 'Kéo - Xô & Vai Sau', cats: ['back', 'biceps'] },
  ];

  const workoutDays: any[] = [];

  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 5; day++) {
      const date = new Date(monday);
      date.setDate(date.getDate() + week * 7 + day);
      const config = workoutConfigs[day];
      const pool = allExercises.filter(e => config.cats.some(c => e.category === c));

      const wd = await prisma.workoutDay.create({
        data: { planId: workoutPlan.id, dayIndex: date.getDay(), date, focus: config.focus, notes: week === 0 ? 'Tuần đầu - tập trung form và làm quen động tác.' : null, completed: date < new Date() },
      });

      for (let i = 0; i < Math.min(6, pool.length); i++) {
        await prisma.workoutExercise.create({
          data: { workoutDayId: wd.id, exerciseId: pool[i].id, sets: i < 3 ? 4 : 3, reps: i < 3 ? '8-12' : '10-15', restSeconds: i < 3 ? 90 : 60, rpe: i < 3 ? 8 : 7, tempo: '2-0-2', order: i },
        });
      }
      workoutDays.push(wd);
    }
  }

  for (let i = 0; i < 20; i++) {
    const wd = workoutDays[i];
    const wdDate = new Date(wd.date);
    if (wdDate > new Date()) break;

    const log = await prisma.workoutLog.create({
      data: {
        userId: user.id, workoutDayId: wd.id, date: wdDate,
        completed: wdDate.getDate() % 7 !== 0,
        skippedReason: wdDate.getDate() % 7 === 0 ? 'Ngày nghỉ' : undefined,
        notes: i < 3 ? 'Buổi tập tốt, cảm thấy khỏe' : 'Tập ổn',
      },
    });

    if (log.completed) {
      const exList = await prisma.workoutExercise.findMany({ where: { workoutDayId: wd.id }, orderBy: { order: 'asc' } });
      for (const we of exList) {
        await prisma.exerciseLog.create({
          data: { workoutLogId: log.id, exerciseId: we.exerciseId, setsCompleted: we.sets, reps: String(parseInt(we.reps.split('-')[1] || '10')), weight: we.order < 3 ? 40 + i * 2.5 + Math.floor(Math.random() * 5) : 15 + Math.floor(Math.random() * 10), rpe: we.rpe },
        });
      }
    }
  }

  const nutritionPlan = await prisma.nutritionPlan.create({
    data: { userId: user.id, caloriesTarget: 2600, proteinTarget: 160, carbTarget: 325, fatTarget: 72, waterTarget: 2600, startDate: fourWeeksAgo },
  });

  await prisma.meal.createMany({
    data: [
      { nutritionPlanId: nutritionPlan.id, name: 'Yến Mạch Trứng', mealType: 'breakfast', calories: 650, protein: 40, carbs: 80, fat: 20, ingredients: '80g yến mạch, 3 trứng, 200ml sữa, 1 chuối, quế', instructions: 'Nấu yến mạch với sữa. Chiên trứng. Dọn kèm chuối cắt lát.' },
      { nutritionPlanId: nutritionPlan.id, name: 'Cơm Gà', mealType: 'lunch', calories: 750, protein: 50, carbs: 90, fat: 18, ingredients: '180g ức gà, 250g cơm, 150g bông cải, 1 muỗng dầu olive, nước tương', instructions: 'Nướng gà với gia vị. Nấu cơm và hấp bông cải. Rưới dầu olive.' },
      { nutritionPlanId: nutritionPlan.id, name: 'Sữa Chua Hy Lạp', mealType: 'snack', calories: 400, protein: 30, carbs: 40, fat: 15, ingredients: '250g sữa chua Hy Lạp, 30g hạnh nhân, 20g whey, việt quất, mật ong', instructions: 'Trộn sữa chua với whey. Thêm hạnh nhân và việt quất. Rưới mật ong.' },
      { nutritionPlanId: nutritionPlan.id, name: 'Cá Hồi Khoai Lang', mealType: 'dinner', calories: 700, protein: 45, carbs: 70, fat: 25, ingredients: '180g cá hồi phi lê, 250g khoai lang, rau trộn, chanh, dầu olive', instructions: 'Nướng cá hồi và khoai lang ở 200 độ trong 20 phút. Dọn kèm rau tươi.' },
      { nutritionPlanId: nutritionPlan.id, name: 'Pudding Casein', mealType: 'snack', calories: 250, protein: 25, carbs: 20, fat: 8, ingredients: '1 muỗng casein, 200ml sữa, 10g hạt chia', instructions: 'Trộn casein với sữa và hạt chia. Để tủ lạnh 30 phút trước khi ăn.' },
    ],
  });

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    d.setHours(0, 0, 0, 0);
    await prisma.nutritionLog.create({
      data: { userId: user.id, date: d, calories: 2400 + Math.floor(Math.random() * 400), protein: 140 + Math.floor(Math.random() * 40), carbs: Math.round(325 * (0.8 + Math.random() * 0.4)), fat: Math.round(72 * (0.8 + Math.random() * 0.4)), water: 2000 + Math.floor(Math.random() * 600), notes: i % 5 === 0 ? 'Ăn ngoài, ước lượng macro' : null },
    });
  }

  const startWeight = 75.5;
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    d.setHours(0, 0, 0, 0);
    const w = startWeight + (-0.05 - Math.random() * 0.1) * i;
    await prisma.bodyMetric.create({
      data: { userId: user.id, date: d, weight: Math.round(w * 10) / 10, bodyFat: i % 3 === 0 ? 18 - i * 0.1 : undefined, waist: i % 3 === 0 ? 88 - i * 0.2 : undefined, chest: i % 3 === 0 ? 102 + i * 0.1 : undefined, arm: i % 3 === 0 ? 36 + i * 0.05 : undefined },
    });
  }

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i));
    d.setHours(0, 0, 0, 0);
    await prisma.dailyCheckIn.create({
      data: { userId: user.id, date: d, sleepHours: 6.5 + Math.random() * 1.5, energy: 6 + Math.floor(Math.random() * 3), stress: 2 + Math.floor(Math.random() * 5), mood: 6 + Math.floor(Math.random() * 3), soreness: 3 + Math.floor(Math.random() * 5), hunger: 4 + Math.floor(Math.random() * 4), motivation: 7 + Math.floor(Math.random() * 3), painNote: i === 3 ? 'Hơi đau gối khi squat' : null, dailyNote: i % 2 === 0 ? 'Cảm thấy ổn, đang tiến bộ.' : null },
    });
  }

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    d.setHours(0, 0, 0, 0);
    await prisma.progressRecord.create({
      data: { userId: user.id, date: d, adherenceScore: 70 + Math.floor(Math.random() * 30), workoutCompletionRate: 80 + Math.random() * 20, caloriesAdherence: 85 + Math.random() * 15, proteinAdherence: 75 + Math.random() * 25, weightTrend: 'losing', strengthTrend: 'improving' },
    });
  }

  await prisma.aiCoachInsight.createMany({
    data: [
      { userId: user.id, type: 'weekly_review', title: 'Tổng Kết Tuần - Có Tiến Bộ', content: 'Bạn đã hoàn thành 5/5 buổi tập, đạm đạt 88%, cân nặng giảm 0.3kg. Tốc độ phù hợp với body recomposition. Bench press tăng 2.5kg so với tuần trước.', recommendation: 'Tiếp tục giữ lịch tập. Tăng nhẹ calo 100/ngày nếu thấy mệt kéo dài. Ưu tiên ngủ 7+ tiếng.' },
      { userId: user.id, type: 'daily_suggestion', title: 'Hôm Nay Tập Đẩy - Ngực & Vai', content: 'Năng lượng 8/10, đau cơ nhẹ 3/10. Điều kiện tốt để đẩy intensity. Hôm qua đạm đạt 145/160g.', recommendation: 'Tập trung bench press với RPE 8-9. Tăng 2.5kg nếu khỏe. Nhớ khởi động vai kỹ.' },
      { userId: user.id, type: 'encouragement', title: 'Duy Trì Xuất Sắc!', content: 'Đã 3 tuần liên tiếp hoàn thành 100% lịch tập. Body fat giảm từ 18% xuống 17.2%.', recommendation: 'Tiếp tục! Bạn đang đúng tiến độ đạt 14% body fat trong 12 tuần.' },
    ],
  });

  console.log('Seed hoàn tất!');
  console.log('User: ' + user.name + ' (' + user.id + ')');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
