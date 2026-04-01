import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBCrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Test với mật khẩu admin123
        String password = "admin123";
        String hash = encoder.encode(password);
        
        System.out.println("Password: " + password);
        System.out.println("Generated Hash: " + hash);
        System.out.println("Stored Hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi");
        
        // Test matching
        boolean matches1 = encoder.matches(password, hash);
        boolean matches2 = encoder.matches(password, "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi");
        
        System.out.println("Generated hash matches: " + matches1);
        System.out.println("Stored hash matches: " + matches2);
    }
}
