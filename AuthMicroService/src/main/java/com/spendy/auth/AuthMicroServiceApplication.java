package com.spendy.auth;

//import io.github.cdimascio.dotenv.Dotenv;
import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.spendy.auth")
@ApplicationPath("/api")
public class AuthMicroServiceApplication extends ResourceConfig
{
    public AuthMicroServiceApplication()
    {
        packages("com/spendy/auth/Controller");
    }

    public static void main(String[] args)
    {
        // Carica .env dalla cartella padre (root del progetto)
        //Dotenv dotenv = Dotenv.configure()
        //        .directory("./") // <--- PUNTA ALLA ROOT
        //        .ignoreIfMissing()
        //        .load();

        SpringApplication.run(AuthMicroServiceApplication.class, args);
    }
}
