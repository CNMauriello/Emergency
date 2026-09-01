package com.spendy.auth.Repository;

import com.spendy.auth.Data.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IRefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);
    void deleteByUsername(String username);

}
