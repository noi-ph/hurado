import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // We have 3 fixed names
        String[] names = {"Alvin", "Berto", "Carlo"};
        // We will store the ages in a separate array
        int[] ages = new int[3];

        // Read the 3 ages
        for (int i = 0; i < 3; i++) {
            ages[i] = scanner.nextInt();
        }

        // Sort both arrays in tandem based on the age
        for (int i = 0; i < 3; i++) {
            for (int j = i + 1; j < 3; j++) {
                // If an earlier age is bigger, swap with the later one
                if (ages[i] > ages[j]) {
                    // Swap the ages
                    int tempAge = ages[i];
                    ages[i] = ages[j];
                    ages[j] = tempAge;

                    // Swap the corresponding names so they stay in sync
                    String tempName = names[i];
                    names[i] = names[j];
                    names[j] = tempName;
                }
            }
        }

        // The largest age is now at the last index (2)
        System.out.println(names[2]);
    }
}
