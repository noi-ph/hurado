import { AppDataSource } from 'orm/data-source';

import { Task } from '../entities/tasks/Task';
import { User } from '../entities/users/User';

async function runSeedData() {
  await AppDataSource.initialize();

  let user = new User();
  const userRepository = AppDataSource.getRepository(User);

  user.username = 'Heisenberg';
  user.firstName = 'Walter';
  user.lastName = 'White';
  user.email = 'admin@admin.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = true;
  await userRepository.save(user);

  user = new User();
  user.username = 'Jesse';
  user.firstName = 'Jesse';
  user.lastName = 'Pinkman';
  user.email = 'standard@standard.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Sky';
  user.firstName = 'Skyler';
  user.lastName = 'White';
  user.email = 'skyler.white@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Hank';
  user.firstName = 'Hank';
  user.lastName = 'Schrader';
  user.email = 'hank.schrader@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Marie';
  user.firstName = 'Marie';
  user.lastName = 'Schrader';
  user.email = 'marie.schrader@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'The Lawyer';
  user.firstName = 'Saul';
  user.lastName = 'Goodman';
  user.email = 'saul.goodman@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Gus';
  user.firstName = 'Gustavo';
  user.lastName = 'Fring';
  user.email = 'gustavo.fring@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Mike';
  user.firstName = 'Michael';
  user.lastName = 'Ehrmantraut';
  user.email = 'michael.ehrmantraut@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Tio';
  user.firstName = 'Hector';
  user.lastName = 'Salamanca';
  user.email = 'hector.salamanca@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Tuco';
  user.firstName = 'Alberto';
  user.lastName = 'Salamanca';
  user.email = 'alberto.salamanca@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  let task = new Task();
  const taskRepository = AppDataSource.getRepository(Task);

  task.ownerId = 1;
  task.title = 'Who is the oldest?';
  task.statement = `Alvin, Berto, and Carlo are friends. Their ages are A, B and C, respectively. No two of them have the same age. Who is the oldest among them?
  
  The input contains three lines. The first line contains a single integer, A. The second line contains a single integer, B. The third line contains a single integer, C.

  Output the name of the oldest among the three, which should be either Alvin, Berto or Carlo.`;
  task.slug = 'whoistheoldest'; // these are randomly generated ryt?
  task.scoreMax = 100;
  task.timeLimit = 2898;
  task.memoryLimit = 8982;
  task.compileTimeLimit = 1188;
  task.compileMemoryLimit = 8811;
  task.submissionSizeLimit = 9999;
  task.isPublicInArchive = true;
  task.checkerScriptId = 1; // placeholder
  task.validatorScriptId = 2; // placeholder
  await taskRepository.save(task);

  task = new Task();
  task.ownerId = 1;
  task.title = 'This Problem Is So Fetch';
  task.statement = `Rob has no opinion on everything. He finds abortion neither good or bad and he is indifferent about whether or not he likes the president's absence during funerals. And unlike many Filipinos, he is not even affected whether Dingdong should have married Marian. Overall, he is a pretty boring person.

  This attitude of Rob was really popular among his classmates and among the debating team. And so, they decided to convince Rob to be pro- or anti- important issues among their class. Today, they are going to give Rob reasons on why or why not their classmate Payton is fetch. No one exactly knows what fetch is, but his classmates seem to want fetch happen. Anyway, you don't really need to know what that word means. It's totally not gonna happen.
  
  Pair-by-pair, they will talk to Rob and try to convince him to agree or disagree with the proposition. Each student has an integer, called the student's convincing power, assigned to them. This is positive if this student thinks Payton is fetch and negative if this student thinks that Payton is not fetch. Rob's opinion on the issue is also represented by an integer. During this time, Rob's opinion only changes after every pair finishes talking to him. The sum of the pair's convincing power is added to Rob's current opinion.
  
  How much (in total) did Rob's opinion on Payton change during the course of that day? Take note that his opinion changes after every talk. See the sample input and explanation in case it is still unclear.
  
  Here is a photo of Payton's Instagram page. Do you think he is fetch or not?Screenshot from 2015-04-11 22:19:41.png
  
  The first line of input contains T, the number of test cases. The following lines describe the test cases. The first line of each test case contains a single integer N. The second line contains N integers separated by spaces, where the $P_i$ number is the ith student's convincing power.
  
  For each test case, print a single integer which is the answer for that test case.`;
  task.slug = 'thisproblemissofetch'; // these are randomly generated ryt?
  task.scoreMax = 100;
  task.timeLimit = 2898;
  task.memoryLimit = 8982;
  task.compileTimeLimit = 1188;
  task.compileMemoryLimit = 8811;
  task.submissionSizeLimit = 9999;
  task.isPublicInArchive = true;
  task.checkerScriptId = 3; // placeholder
  task.validatorScriptId = 4; // placeholder
  await taskRepository.save(task);
}

runSeedData();
