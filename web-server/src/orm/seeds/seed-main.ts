import { AppDataSource } from 'orm/data-source';

import { File, Script, Task, User } from 'orm/entities';

async function runSeedData() {
  await AppDataSource.initialize();

  let user = new User();
  const userRepository = AppDataSource.getRepository(User);

  user.username = 'Heisenberg';
  user.name = 'Walter White';
  user.email = 'admin@admin.com';
  user.setPassword('pass1');
  user.isAdmin = true;
  await userRepository.save(user);

  user = new User();
  user.username = 'Jesse';
  user.name = 'Jesse Pinkman';
  user.email = 'standard@standard.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Sky';
  user.name = 'Skyler White';
  user.email = 'skyler.white@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Hank';
  user.name = 'Hank Schrader';
  user.email = 'hank.schrader@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Marie';
  user.name = 'Marie Schrader';
  user.email = 'marie.schrader@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'The Lawyer';
  user.name = 'Saul Goodman';
  user.email = 'saul.goodman@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Gus';
  user.name = 'Gustavo Fring';
  user.email = 'gustavo.fring@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Mike';
  user.name = 'Michael Ehrmantraut';
  user.email = 'michael.ehrmantraut@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Tio';
  user.name = 'Hector Salamanca';
  user.email = 'hector.salamanca@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Tuco';
  user.name = 'Alberto Salamanca';
  user.email = 'alberto.salamanca@test.com';
  user.setPassword('pass1');
  user.isAdmin = false;
  await userRepository.save(user);

  const fileRepository = AppDataSource.getRepository(File);
  let file = new File('file1.py', 32, 'https://thisisaurl.com/file1.py');
  const file1 = file;
  await fileRepository.save(file1);

  file = new File('file2.py', 32, 'https://thisisaurl.com/file2.py');
  const file2 = file;
  await fileRepository.save(file2);

  let script = new Script(file1, 'python', 'some_arg');
  const scriptRepository = AppDataSource.getRepository(Script);
  const script1 = script;
  await scriptRepository.save(script1);

  script = new Script(file2, 'python', 'some_arg');
  const script2 = script;
  await scriptRepository.save(script2);

  let task = new Task();
  const taskRepository = AppDataSource.getRepository(Task);

  task.owner = Promise.resolve(user);
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
  task.checkerScript = Promise.resolve(script1);
  task.validatorScript = Promise.resolve(script2);
  await taskRepository.save(task);

  task = new Task();
  task.owner = Promise.resolve(user);
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
  task.checkerScript = Promise.resolve(script1);
  task.validatorScript = Promise.resolve(script2);
  await taskRepository.save(task);
}

runSeedData();
