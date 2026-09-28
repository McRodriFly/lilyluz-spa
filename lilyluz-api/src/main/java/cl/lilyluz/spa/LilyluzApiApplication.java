package cl.lilyluz.spa;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class LilyluzApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(LilyluzApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDatabase(JdbcTemplate jdbc) {
		return args -> {
			try {
				jdbc.execute("ALTER TABLE visitas ALTER COLUMN estado VARCHAR(50)");
			} catch (Exception e) {
				System.out.println("Nota alter table: " + e.getMessage());
			}
		};
	}
}
