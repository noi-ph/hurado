import java.util.Scanner;
import java.util.Arrays;

public class Main {
    static class Person implements Comparable<Person> {
        String name;
        int age;

        Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public int compareTo(Person other) {
            return this.age - other.age;
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        String[] names = {"Alvin", "Berto", "Carlo"};
        Person[] people = new Person[3];
        for (int i = 0; i < 3; i++) {
            int age = scanner.nextInt();
            people[i] = new Person(names[i], age);
        }

        Arrays.sort(people);
        // The largest age is now at the last index (2)
        System.out.println(people[2].name);
    }
}
