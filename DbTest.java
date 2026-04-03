import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";
        Properties props = new Properties();
        props.setProperty("user", "postgres.kjfnppezhkojlrdemjot");
        props.setProperty("password", "youtubelover1836");
        props.setProperty("ssl", "true");
        props.setProperty("sslmode", "require");

        System.out.println("Connecting to " + url + "...");
        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("SUCCESS: Connected to Supabase!");
        } catch (Exception e) {
            System.out.println("FAILURE: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
