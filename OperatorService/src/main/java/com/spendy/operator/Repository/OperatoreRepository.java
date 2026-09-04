package com.spendy.operator.Repository;

import com.spendy.operator.Entity.Operatore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperatoreRepository extends JpaRepository<Operatore, Long> {
    Optional<Operatore> findByAuthUserId(Long authUserId);
}
